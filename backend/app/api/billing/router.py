"""
Billing and subscription API routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List
import structlog

from app.core.database import get_db
from app.core.dependencies import require_auth
from app.models.user import User, PlanType
from app.models.webhook_event import WebhookEvent
from app.services.stripe_service import StripeService
from app.core.config import settings

logger = structlog.get_logger()

router = APIRouter()

class CheckoutRequest(BaseModel):
    plan: str  # "standard" or "enterprise"
    billing_period: str = "monthly"  # "monthly" or "yearly"

class PortalRequest(BaseModel):
    return_url: str

class SubscriptionResponse(BaseModel):
    id: Optional[str] = None
    status: Optional[str] = None
    plan: str
    current_period_start: Optional[int] = None
    current_period_end: Optional[int] = None
    cancel_at_period_end: Optional[bool] = None

class InvoiceResponse(BaseModel):
    id: str
    number: Optional[str] = None
    status: str
    amount_paid: int
    amount_due: int
    currency: str
    created: int
    invoice_pdf: Optional[str] = None
    hosted_invoice_url: Optional[str] = None

@router.post("/create-checkout")
async def create_checkout_session(
    checkout_data: CheckoutRequest,
    current_user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Create Stripe checkout session"""
    
    stripe_service = StripeService()
    
    # Validate plan
    if checkout_data.plan not in ["standard", "enterprise"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan selected"
        )
    
    # Validate billing period
    if checkout_data.billing_period not in ["monthly", "yearly"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid billing period. Must be 'monthly' or 'yearly'"
        )
    
    # Get price ID based on plan and billing period
    if checkout_data.plan == "standard":
        if checkout_data.billing_period == "yearly":
            price_id = settings.STRIPE_STANDARD_YEARLY_PRICE_ID
        else:
            price_id = settings.STRIPE_STANDARD_MONTHLY_PRICE_ID
    else:
        # Enterprise plan
        if checkout_data.billing_period == "yearly":
            price_id = settings.STRIPE_ENTERPRISE_YEARLY_PRICE_ID
        else:
            price_id = settings.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID
    
    if not price_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Price ID not configured for {checkout_data.plan} plan"
        )
    
    # Create or get Stripe customer
    if not current_user.stripe_customer_id:
        try:
            customer_id = await stripe_service.create_customer(
                email=current_user.email,
                name=current_user.full_name
            )
            
            current_user.stripe_customer_id = customer_id
            await db.commit()
            
        except Exception as e:
            logger.error("stripe_customer_creation_failed", 
                        user_id=current_user.id, 
                        error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create customer"
            )
    
    # Create checkout session
    try:
        success_url = "https://app.tidyframe.com/billing/success?session_id={CHECKOUT_SESSION_ID}"
        cancel_url = "https://app.tidyframe.com/billing/cancelled"
        
        checkout_url = await stripe_service.create_checkout_session(
            customer_id=current_user.stripe_customer_id,
            price_id=price_id,
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": str(current_user.id),
                "plan": checkout_data.plan
            }
        )
        
        return {"checkout_url": checkout_url}
        
    except Exception as e:
        logger.error("checkout_session_creation_failed", 
                    user_id=current_user.id, 
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create checkout session"
        )

@router.post("/portal")
async def create_portal_session(
    portal_data: PortalRequest,
    current_user: User = Depends(require_auth)
):
    """Create Stripe customer portal session"""
    
    if not current_user.stripe_customer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No Stripe customer found. Please subscribe first."
        )
    
    stripe_service = StripeService()
    
    try:
        portal_url = await stripe_service.create_portal_session(
            customer_id=current_user.stripe_customer_id,
            return_url=portal_data.return_url
        )
        
        return {"portal_url": portal_url}
        
    except Exception as e:
        logger.error("portal_session_creation_failed", 
                    user_id=current_user.id, 
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create portal session"
        )

@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(
    current_user: User = Depends(require_auth)
):
    """Get user's subscription details"""
    
    if not current_user.stripe_subscription_id:
        return SubscriptionResponse(
            plan=current_user.plan.value,
            status="inactive"
        )
    
    stripe_service = StripeService()
    
    try:
        subscription = await stripe_service.get_subscription(
            current_user.stripe_subscription_id
        )
        
        return SubscriptionResponse(
            id=subscription["id"],
            status=subscription["status"],
            plan=current_user.plan.value,
            current_period_start=subscription["current_period_start"],
            current_period_end=subscription["current_period_end"],
            cancel_at_period_end=subscription["cancel_at_period_end"]
        )
        
    except Exception as e:
        logger.error("subscription_retrieval_failed", 
                    user_id=current_user.id, 
                    subscription_id=current_user.stripe_subscription_id,
                    error=str(e))
        
        # Return basic info if Stripe call fails
        return SubscriptionResponse(
            plan=current_user.plan.value,
            status="unknown"
        )

@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(require_auth)
):
    """Cancel user's subscription"""
    
    if not current_user.stripe_subscription_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active subscription found"
        )
    
    stripe_service = StripeService()
    
    try:
        result = await stripe_service.cancel_subscription(
            current_user.stripe_subscription_id,
            at_period_end=True
        )
        
        return {
            "message": "Subscription will be cancelled at the end of the current billing period",
            "cancel_at_period_end": result["cancel_at_period_end"]
        }
        
    except Exception as e:
        logger.error("subscription_cancellation_failed", 
                    user_id=current_user.id, 
                    subscription_id=current_user.stripe_subscription_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel subscription"
        )

@router.get("/invoices", response_model=List[InvoiceResponse])
async def get_invoices(
    current_user: User = Depends(require_auth)
):
    """Get user's invoices"""
    
    if not current_user.stripe_customer_id:
        return []
    
    stripe_service = StripeService()
    
    try:
        invoices = await stripe_service.get_customer_invoices(
            current_user.stripe_customer_id
        )
        
        return [InvoiceResponse(**invoice) for invoice in invoices]
        
    except Exception as e:
        logger.error("invoices_retrieval_failed", 
                    user_id=current_user.id, 
                    customer_id=current_user.stripe_customer_id,
                    error=str(e))
        return []

@router.post("/stripe/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Handle main Stripe webhooks"""
    
    # Get request body
    payload = await request.body()
    signature = request.headers.get("stripe-signature")
    
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe signature"
        )
    
    stripe_service = StripeService()
    
    try:
        # Verify webhook with main webhook secret
        event = stripe_service.construct_webhook_event(payload, signature, webhook_type="main")
        
        # Check if we've already processed this event
        from sqlalchemy import select
        existing_event = await db.execute(
            select(WebhookEvent).where(
                WebhookEvent.external_event_id == event.id
            )
        )
        
        if existing_event.scalar_one_or_none():
            logger.info("webhook_event_already_processed", event_id=event.id)
            return {"status": "already_processed"}
        
        # Create webhook event record
        webhook_event = WebhookEvent(
            external_event_id=event.id,
            event_type=event.type,
            source="stripe",
            data=event.data
        )
        db.add(webhook_event)
        
        # Process the event
        result = await process_stripe_event(event, db)
        
        if result.get("processed"):
            webhook_event.mark_processed()
        else:
            webhook_event.mark_failed(result.get("error", "Unknown error"))
        
        await db.commit()
        
        return {"status": "processed"}
        
    except Exception as e:
        logger.error("webhook_processing_failed", 
                    event_type=event.type if 'event' in locals() else 'unknown',
                    error=str(e))
        
        if 'webhook_event' in locals():
            webhook_event.mark_failed(str(e))
            await db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook processing failed"
        )

@router.post("/stripe/meter/webhook")
async def stripe_meter_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Handle Stripe billing meter webhooks"""
    
    # Get request body
    payload = await request.body()
    signature = request.headers.get("stripe-signature")
    
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe signature"
        )
    
    stripe_service = StripeService()
    
    try:
        # Verify webhook with meter webhook secret
        event = stripe_service.construct_webhook_event(payload, signature, webhook_type="meter")
        
        # Process meter-specific events
        if event.type == "v1.billing.meter.error_report_triggered":
            logger.error("billing_meter_error_report", 
                        event_data=event.data,
                        event_id=event.id)
            # Handle meter error reports
            return {"status": "acknowledged"}
        
        logger.info("meter_webhook_received", event_type=event.type)
        return {"status": "processed"}
        
    except Exception as e:
        logger.error("meter_webhook_processing_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Meter webhook processing failed"
        )

async def process_stripe_event(event, db: AsyncSession) -> dict:
    """Process individual Stripe webhook events"""
    
    stripe_service = StripeService()
    event_type = event.type
    data = event.data.object
    
    try:
        if event_type == "checkout.session.completed":
            return await handle_checkout_completed(data, db)
        elif event_type == "customer.subscription.created":
            return await handle_subscription_created(data, db)
        elif event_type == "customer.subscription.updated":
            return await handle_subscription_updated(data, db)
        elif event_type == "customer.subscription.deleted":
            return await handle_subscription_deleted(data, db)
        elif event_type == "invoice.payment_succeeded":
            return await handle_payment_succeeded(data, db)
        elif event_type == "invoice.payment_failed":
            return await handle_payment_failed(data, db)
        else:
            logger.info("webhook_event_ignored", event_type=event_type)
            return {"processed": False, "reason": "Event type not handled"}
            
    except Exception as e:
        logger.error("event_processing_failed", 
                    event_type=event_type, 
                    error=str(e))
        return {"processed": False, "error": str(e)}

async def handle_checkout_completed(session_data: dict, db: AsyncSession) -> dict:
    """Handle successful checkout session completion - upgrade user from FREE to STANDARD"""
    
    customer_id = session_data["customer"]
    subscription_id = session_data.get("subscription")
    metadata = session_data.get("metadata", {})
    plan = metadata.get("plan", "standard")
    
    # Find user by Stripe customer ID
    from sqlalchemy import select
    result = await db.execute(
        select(User).where(User.stripe_customer_id == customer_id)
    )
    user = result.scalar_one_or_none()
    
    if user:
        # Update user's subscription and plan
        if subscription_id:
            user.stripe_subscription_id = subscription_id
        
        # Upgrade from FREE to the appropriate paid plan
        if plan == "enterprise":
            user.plan = PlanType.ENTERPRISE
        else:
            user.plan = PlanType.STANDARD
        
        await db.commit()
        
        logger.info("checkout_completed_processed", 
                   user_id=user.id,
                   subscription_id=subscription_id,
                   plan=plan,
                   upgraded_from="FREE")
    else:
        logger.error("checkout_completed_user_not_found", customer_id=customer_id)
    
    return {"processed": True}

async def handle_subscription_created(subscription_data: dict, db: AsyncSession) -> dict:
    """Handle subscription creation"""
    
    customer_id = subscription_data["customer"]
    subscription_id = subscription_data["id"]
    
    # Find user by Stripe customer ID
    from sqlalchemy import select
    result = await db.execute(
        select(User).where(User.stripe_customer_id == customer_id)
    )
    user = result.scalar_one_or_none()
    
    if user:
        user.stripe_subscription_id = subscription_id
        # Plan will be updated based on price ID in subscription.updated
        await db.commit()
        
        logger.info("subscription_created_processed", 
                   user_id=user.id,
                   subscription_id=subscription_id)
    
    return {"processed": True}

async def handle_subscription_updated(subscription_data: dict, db: AsyncSession) -> dict:
    """Handle subscription updates"""
    
    customer_id = subscription_data["customer"]
    subscription_id = subscription_data["id"]
    status = subscription_data["status"]
    
    # Find user
    from sqlalchemy import select
    result = await db.execute(
        select(User).where(User.stripe_customer_id == customer_id)
    )
    user = result.scalar_one_or_none()
    
    if user:
        # Update subscription status and plan based on price ID
        items = subscription_data.get("items", {}).get("data", [])
        if items:
            price_id = items[0].get("price", {}).get("id")
            
            if price_id in [settings.STRIPE_STANDARD_MONTHLY_PRICE_ID, settings.STRIPE_STANDARD_YEARLY_PRICE_ID]:
                user.plan = PlanType.STANDARD
            elif price_id in [settings.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID, settings.STRIPE_ENTERPRISE_YEARLY_PRICE_ID]:
                user.plan = PlanType.ENTERPRISE
        
        # If subscription is cancelled or past due, might want to handle differently
        if status in ["canceled", "past_due"]:
            # Could downgrade to free tier or mark account as limited
            pass
        
        await db.commit()
        
        logger.info("subscription_updated_processed", 
                   user_id=user.id,
                   subscription_id=subscription_id,
                   status=status)
    
    return {"processed": True}

async def handle_subscription_deleted(subscription_data: dict, db: AsyncSession) -> dict:
    """Handle subscription deletion - downgrade to FREE plan"""
    
    customer_id = subscription_data["customer"]
    subscription_id = subscription_data["id"]
    
    # Find user
    from sqlalchemy import select
    result = await db.execute(
        select(User).where(User.stripe_customer_id == customer_id)
    )
    user = result.scalar_one_or_none()
    
    if user:
        user.stripe_subscription_id = None
        # Downgrade to free tier
        user.plan = PlanType.FREE
        await db.commit()
        
        logger.info("subscription_deleted_processed", 
                   user_id=user.id,
                   subscription_id=subscription_id,
                   downgraded_to="FREE")
    
    return {"processed": True}

async def handle_payment_succeeded(invoice_data: dict, db: AsyncSession) -> dict:
    """Handle successful payment"""
    
    customer_id = invoice_data["customer"]
    
    # Find user and reset usage if it's a new billing period
    from sqlalchemy import select
    result = await db.execute(
        select(User).where(User.stripe_customer_id == customer_id)
    )
    user = result.scalar_one_or_none()
    
    if user:
        # Reset monthly usage for new billing period
        from datetime import datetime, timezone, timedelta
        user.parses_this_month = 0
        user.month_reset_date = datetime.now(timezone.utc) + timedelta(days=30)
        
        await db.commit()
        
        logger.info("payment_succeeded_processed", user_id=user.id)
    
    return {"processed": True}

async def handle_payment_failed(invoice_data: dict, db: AsyncSession) -> dict:
    """Handle failed payment"""
    
    customer_id = invoice_data["customer"]
    
    # Could send email notification or limit account access
    logger.warning("payment_failed", customer_id=customer_id)
    
    return {"processed": True}