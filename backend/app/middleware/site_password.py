"""
Site Password Protection Middleware
Provides temporary password protection for the entire site before public launch
"""

from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import structlog
import hashlib
from typing import Optional

logger = structlog.get_logger()


class SitePasswordMiddleware(BaseHTTPMiddleware):
    """
    Middleware to protect the entire site with a password during pre-launch phase.
    
    Features:
    - Session-based authentication (once authenticated, user stays authenticated)
    - Configurable via environment variables
    - Easy to enable/disable
    - Secure password hashing
    - Proper error handling and logging
    """
    
    def __init__(self, app, enabled: bool = False, password: Optional[str] = None):
        super().__init__(app)
        self.enabled = enabled
        self.password_hash = self._hash_password(password) if password else None
        self.session_cookie_name = "site_password_authenticated"
        
        # Paths that should be excluded from password protection
        self.excluded_paths = {
            "/health",
            "/api/site-password/status",
            "/api/site-password/check",
            "/api/site-password/authenticate",
            "/favicon.ico",
        }
        
        # Allow static assets and API docs (if needed)
        self.excluded_prefixes = [
            "/static/",
            "/assets/",
            "/api/admin/",  # Allow admin API endpoints
            "/admin/",      # Allow admin frontend routes
            "/api/auth/",   # Allow authentication endpoints
        ]
        
        if self.enabled and not password:
            logger.warning("Site password protection is enabled but no password is configured!")
            
        logger.info(
            "site_password_middleware_initialized",
            enabled=self.enabled,
            has_password=bool(self.password_hash)
        )
    
    def _hash_password(self, password: str) -> str:
        """Hash password using SHA-256 for comparison"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def _is_path_excluded(self, path: str) -> bool:
        """Check if the path should be excluded from password protection"""
        if path in self.excluded_paths:
            return True
            
        for prefix in self.excluded_prefixes:
            if path.startswith(prefix):
                return True
                
        return False
    
    def _is_authenticated(self, request: Request) -> bool:
        """Check if the user is already authenticated via session cookie or header"""
        # Check header first (for API requests)
        site_password_header = request.headers.get("x-site-password")
        if site_password_header and self.verify_password(site_password_header):
            return True
        
        # Check cookie (for browser sessions)
        auth_cookie = request.cookies.get(self.session_cookie_name)
        if not auth_cookie:
            return False
            
        # Verify the cookie value (simple hash of password)
        expected_cookie_value = hashlib.sha256(
            f"authenticated_{self.password_hash}".encode()
        ).hexdigest()
        
        return auth_cookie == expected_cookie_value
    
    def _create_auth_cookie_value(self) -> str:
        """Create the authentication cookie value"""
        return hashlib.sha256(
            f"authenticated_{self.password_hash}".encode()
        ).hexdigest()
    
    def _has_valid_api_key_format(self, request: Request) -> bool:
        """Check if request has a valid API key format (bypass site password for API clients)"""
        auth_header = request.headers.get("authorization")
        if not auth_header:
            return False
        
        # Check for Bearer token that looks like an API key
        if auth_header.startswith("Bearer ") and len(auth_header) > 7:
            token = auth_header[7:]  # Remove "Bearer " prefix
            # API keys start with "tf_" - let the authentication system validate the actual key
            return token.startswith("tf_")
        
        return False
    
    def _is_admin_user(self, request: Request) -> bool:
        """Check if the request is from an admin user via JWT token
        
        Note: We decode the JWT to check the is_admin claim that was set during login.
        The actual auth middleware validates the token properly.
        """
        auth_header = request.headers.get("authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return False
        
        try:
            token = auth_header[7:]  # Remove "Bearer " prefix
            
            # Import jwt and settings locally to avoid import issues
            from app.core.config import settings
            from jose import jwt
            
            # Properly verify JWT token
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            except jwt.InvalidTokenError:
                # Invalid token, not an admin
                return False
            
            # Check the is_admin claim in the JWT
            # This claim is set during login based on the database is_admin column
            is_admin = payload.get("is_admin", False)
            
            if is_admin:
                email = payload.get("email", "unknown")
                logger.info(f"Admin user {email} bypassing site password")
                return True
                    
        except Exception:
            # Silently fail - the actual auth middleware will handle JWT validation
            pass
            
        return False
    
    async def dispatch(self, request: Request, call_next):
        """Main middleware dispatch method"""
        
        # Skip if middleware is disabled
        if not self.enabled:
            return await call_next(request)
        
        # Skip if no password is configured
        if not self.password_hash:
            logger.warning("Site password middleware enabled but no password configured")
            return await call_next(request)
        
        # Always allow OPTIONS requests for CORS preflight
        if request.method == "OPTIONS":
            return await call_next(request)
        
        path = request.url.path
        
        # Skip excluded paths
        if self._is_path_excluded(path):
            return await call_next(request)
        
        # Check if user is already authenticated
        if self._is_authenticated(request):
            return await call_next(request)
        
        # Check for API key authentication (bypass site password for API clients)
        if self._has_valid_api_key_format(request):
            return await call_next(request)
        
        # Check if user is admin (bypass site password for admin users)
        if self._is_admin_user(request):
            return await call_next(request)
        
        # User is not authenticated, deny access
        logger.info(
            "site_password_access_denied",
            path=path,
            client_ip=request.client.host,
            user_agent=request.headers.get("user-agent", "unknown")
        )
        
        # Return 401 for API endpoints
        if path.startswith("/api/"):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "error": True,
                    "message": "Site password required",
                    "code": "SITE_PASSWORD_REQUIRED"
                }
            )
        
        # For non-API requests, return 401 (frontend will handle redirect)
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "error": True,
                "message": "Site password required",
                "code": "SITE_PASSWORD_REQUIRED"
            }
        )
    
    def verify_password(self, password: str) -> bool:
        """Verify a password against the stored hash"""
        if not self.password_hash:
            return False
        return self._hash_password(password) == self.password_hash
    
    def create_authenticated_response(self, response: Response) -> Response:
        """Add authentication cookie to response"""
        if self.password_hash:
            cookie_value = self._create_auth_cookie_value()
            from app.core.config import settings
            response.set_cookie(
                key=self.session_cookie_name,
                value=cookie_value,
                httponly=True,
                secure=settings.ENVIRONMENT == "production",  # HTTPS only in production
                samesite="lax",
                max_age=86400 * 7  # 7 days
            )
        return response