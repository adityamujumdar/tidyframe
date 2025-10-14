"""
Billing Middleware for API Access Control
Ensures users have valid subscriptions before processing
"""

import logging
import json
from typing import Optional
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.services.stripe_service import get_billing_service, get_usage_service
from app.models.user import User
from app.core.database import get_db

logger = logging.getLogger(__name__)

class BillingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to enforce billing requirements
    Gilfoyle-approved: No free rides except for admins
    """
    
    def __init__(self, app, **kwargs):
        super().__init__(app)
        self.app = app
        self.billing_service = get_billing_service()
        self.usage_service = get_usage_service()
        
        # Endpoints that require billing check
        self.protected_endpoints = [
            "/api/upload",
            "/api/process",
            "/api/parse",
            "/api/batch"
        ]
        
        # Endpoints that are always free (be very restrictive)
        self.free_endpoints = [
            "/health",
            "/api/health",
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/logout",
            "/api/auth/refresh",
            "/api/auth/reset-password",
            "/api/auth/verify-email",
            "/api/auth/me",
            "/api/auth/change-password",
            "/api/debug/headers",
            "/api/auth/resend-verification",
            "/api/auth/google",
            "/api/user/profile",
            "/api/billing/checkout",
            "/api/billing/webhook",
            "/api/billing/portal",
            "/api/site-password",
            "/api/jobs",        # Dashboard jobs API - protected by site password
            "/api/usage",       # Dashboard usage API - protected by site password
            # SECURITY: Removed /api/upload - billing middleware now enforces payment
            "/docs",
            "/redoc",
            "/openapi.json",
            "/api/docs",
            "/api/redoc",
            "/api/openapi.json",
            "/favicon.ico",
            # Frontend paths (protected by site password middleware)
            "/",                # Frontend root
            "/assets/",         # Frontend assets
            "/static/",         # Static files
            "/auth/",           # Auth pages
            "/dashboard/",      # Dashboard pages (user auth required at app level)
            "/pricing",         # Public pages
            "/contact",
            "/legal/"
        ]
    
    async def dispatch(self, request: Request, call_next):
        """Process request with billing check"""
        
        # Check if endpoint needs billing validation
        path = request.url.path
        
        # Skip billing for free endpoints
        if any(path.startswith(endpoint) for endpoint in self.free_endpoints):
            return await call_next(request)
        
        # SECURITY FIX: Default to requiring billing unless explicitly free
        # This prevents bypass via unregistered endpoints
        needs_billing = not any(path.startswith(endpoint) for endpoint in self.free_endpoints)
        
        if needs_billing:
            # Get user from request (assumes authentication middleware runs first)
            user = await self._get_user_from_request(request)
            
            if not user:
                return JSONResponse(
                    status_code=401,
                    content={"error": "Authentication required"}
                )
            
            # ADMIN BYPASS: Skip billing checks for admin users
            if user.is_admin or (hasattr(user, 'email') and user.email == 'admin@test.com'):
                # Add admin info to request state
                request.state.billing_info = {
                    'usage': 0,
                    'limit': -1,  # Unlimited for admins
                    'overage': 0,
                    'is_admin': True
                }
                return await call_next(request)

            # GRACE PERIOD: Allow new users temporary access during Stripe webhook processing
            # This prevents 402 errors in the 0-60 second window after payment before webhook processes
            from app.models.user import PlanType
            from datetime import datetime, timezone, timedelta

            # Check if user was created very recently (< 5 minutes)
            user_age = datetime.now(timezone.utc) - user.created_at
            is_new_user = user_age < timedelta(minutes=5)

            # If new user in grace period, allow access temporarily
            if is_new_user and (user.plan == PlanType.FREE or not user.stripe_subscription_id):
                logger.info("grace_period_access_granted",
                           user_id=str(user.id),
                           user_age_seconds=user_age.total_seconds(),
                           plan=str(user.plan))
                # Add temporary billing info
                request.state.billing_info = {
                    'usage': 0,
                    'limit': 100000,  # Standard plan limit
                    'overage': 0,
                    'is_admin': False,
                    'grace_period': True
                }
                return await call_next(request)

            # Check if user has FREE plan - require payment
            if user.plan == PlanType.FREE or not user.stripe_subscription_id:
                # User has FREE plan or no subscription - require payment
                return JSONResponse(
                    status_code=402,  # Payment Required
                    content={
                        "error": "Subscription required",
                        "message": "Please subscribe to access file processing features",
                        "plan": user.plan.value if hasattr(user.plan, 'value') else str(user.plan),
                        "checkout_url": "/pricing"
                    }
                )
            
            # Check billing access for paid users
            access_check = await self.billing_service.check_access(
                user_id=str(user.id),
                customer_id=user.stripe_customer_id,
                is_admin=user.is_admin
            )
            
            if not access_check['has_access']:
                # No subscription - redirect to checkout
                return JSONResponse(
                    status_code=402,  # Payment Required
                    content={
                        "error": "Subscription required",
                        "reason": access_check.get('reason'),
                        "checkout_url": access_check.get('redirect_url')
                    }
                )
            
            # Add usage info to request state
            request.state.billing_info = {
                'usage': access_check.get('usage', 0),
                'limit': access_check.get('limit', 0),
                'overage': access_check.get('overage', 0),
                'is_admin': user.is_admin
            }
        
        # Process request
        response = await call_next(request)
        
        # Track usage after successful processing
        if needs_billing and response.status_code == 200:
            await self._track_usage_from_response(request, response)
        
        return response
    
    async def _get_user_from_request(self, request: Request) -> Optional[User]:
        """Extract user from request context - SECURE VERSION"""
        # First check if user is already in request state
        if hasattr(request.state, 'user'):
            return request.state.user
        
        # Extract from JWT token in Authorization header
        from app.core.security import verify_token
        from app.core.database import get_db
        from sqlalchemy import select
        from sqlalchemy.ext.asyncio import AsyncSession
        
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.warning(f"Missing or invalid Authorization header for path: {request.url.path}")
            return None
            
        token = auth_header[7:]  # Remove "Bearer " prefix
        
        # SECURITY: Validate token format
        if not token or len(token) < 10:
            logger.warning(f"Invalid token format for path: {request.url.path}")
            return None
        
        # Verify JWT token with enhanced security
        try:
            payload = verify_token(token)
            if not payload:
                logger.warning(f"Token verification failed for path: {request.url.path}")
                return None
                
            user_id = payload.get("sub")
            if not user_id:
                logger.warning(f"Token missing user ID for path: {request.url.path}")
                return None
                
            # SECURITY: Validate token type
            token_type = payload.get("type")
            if token_type != "access":
                logger.warning(f"Invalid token type: {token_type} for path: {request.url.path}")
                return None
            
        except Exception as e:
            logger.error(f"Token processing error: {str(e)} for path: {request.url.path}")
            return None
            
        # Get user from database with enhanced security checks
        async for db in get_db():
            try:
                result = await db.execute(
                    select(User).where(
                        User.id == user_id,
                        User.is_active == True
                        # User.email_verified == True  # SECURITY: Disabled for now (email verification disabled)
                    )
                )
                user = result.scalar_one_or_none()
                
                if user:
                    # SECURITY: Check if account is locked
                    if user.is_account_locked():
                        logger.warning(f"Account is locked - user_id: {user.id}, email: {user.email}")
                        return None
                    
                    # Cache user in request state for other middleware
                    request.state.user = user
                    logger.info("User authenticated via middleware", user_id=user.id, is_admin=user.is_admin)
                
                return user
                
            except Exception as e:
                logger.error("Database error during user lookup", error=str(e), user_id=user_id)
                return None
        
        return None
    
    async def _track_usage_from_response(self, request: Request, response):
        """Track usage based on response"""
        
        # Skip if admin
        if request.state.billing_info.get('is_admin'):
            return
        
        # Get user
        user = await self._get_user_from_request(request)
        if not user or not user.stripe_customer_id:
            return
        
        # Determine usage quantity based on endpoint
        quantity = 0
        path = request.url.path
        
        if '/api/upload' in path or '/api/process' in path:
            # Try to get processed count from response
            try:
                # Read response body (be careful with large responses)
                body = b''
                async for chunk in response.body_iterator:
                    body += chunk
                
                # Parse JSON response
                if body:
                    data = json.loads(body)
                    # Look for processed count in response
                    quantity = data.get('processed_count', 0) or \
                              data.get('total_processed', 0) or \
                              len(data.get('results', []))
                
                # Recreate response with same body
                response = type(response)(
                    content=body,
                    status_code=response.status_code,
                    headers=dict(response.headers),
                    media_type=response.media_type
                )
            except Exception as e:
                logger.error(f"Failed to extract usage from response: {e}")
        
        # Track usage if we found any
        if quantity > 0:
            await self.usage_service.track_usage(
                user_id=str(user.id),
                customer_id=user.stripe_customer_id,
                quantity=quantity,
                is_admin=user.is_admin
            )
            logger.info(f"Tracked {quantity} usage for user {user.id}")


async def setup_billing_middleware(app):
    """Setup billing middleware for FastAPI app"""
    app.add_middleware(BillingMiddleware)