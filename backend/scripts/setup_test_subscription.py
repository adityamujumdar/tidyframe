#!/usr/bin/env python3
"""
Setup test subscription for newaccount@gmail.com
Creates STANDARD subscription with overage pricing for testing
"""

import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.core.database import async_session_maker
from app.models.user import User, PlanType
from app.services.stripe_service import StripeService
import structlog

logger = structlog.get_logger()


async def setup_test_subscription():
    """Create test subscription for newaccount@gmail.com"""

    email = "newaccount@gmail.com"

    async with async_session_maker() as db:
        # Find user
        result = await db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()

        if not user:
            print(f"❌ User {email} not found")
            return False

        if not user.stripe_customer_id:
            print(f"❌ User {email} has no Stripe customer ID")
            return False

        print(f"✅ Found user: {email}")
        print(f"   Customer ID: {user.stripe_customer_id}")
        print(f"   Current plan: {user.plan}")
        print(f"   Current parses: {user.parses_this_month}")

        # Check if already has subscription
        if user.stripe_subscription_id:
            print(f"⚠️  User already has subscription: {user.stripe_subscription_id}")
            response = input("Replace existing subscription? (yes/no): ")
            if response.lower() != "yes":
                print("Cancelled")
                return False

        # Create subscription via StripeService
        stripe_service = StripeService()

        print(f"\n📝 Creating STANDARD subscription with overage pricing...")
        print(f"   Base price ID: {stripe_service.price_monthly}")
        print(f"   Overage price ID: {stripe_service.price_overage}")

        try:
            subscription_data = await stripe_service.create_subscription(
                customer_id=user.stripe_customer_id,
                price_id=stripe_service.price_monthly,
                trial_days=0
            )

            print(f"\n✅ Subscription created successfully!")
            print(f"   Subscription ID: {subscription_data['subscription_id']}")
            print(f"   Status: {subscription_data['status']}")
            print(f"   Items: {len(subscription_data.get('items', []))}")

            # Update user in database
            user.stripe_subscription_id = subscription_data['subscription_id']
            user.plan = PlanType.STANDARD

            await db.commit()

            print(f"\n✅ User upgraded to STANDARD plan")
            print(f"   Subscription ID: {user.stripe_subscription_id}")
            print(f"   Plan: {user.plan}")

            # Verify subscription has overage price
            print(f"\n🔍 Verifying subscription items...")
            subscription = stripe_service.stripe.Subscription.retrieve(
                subscription_data['subscription_id']
            )

            items = subscription.get('items', {}).get('data', [])
            print(f"   Total items: {len(items)}")

            for idx, item in enumerate(items, 1):
                price_id = item['price']['id']
                price_type = item['price'].get('type', 'unknown')
                print(f"   Item {idx}: {price_id} ({price_type})")

            # Check for overage price
            overage_found = any(
                item['price']['id'] == stripe_service.price_overage
                for item in items
            )

            if overage_found:
                print(f"\n✅ Overage price confirmed in subscription!")
            else:
                print(f"\n⚠️  Overage price NOT found - may need webhook processing")

            return True

        except Exception as e:
            print(f"\n❌ Failed to create subscription: {e}")
            import traceback
            traceback.print_exc()
            return False


async def set_parse_count():
    """Set parse count to 99,999 for testing"""

    email = "newaccount@gmail.com"
    target_count = 99999

    async with async_session_maker() as db:
        result = await db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()

        if not user:
            print(f"❌ User {email} not found")
            return False

        old_count = user.parses_this_month
        user.parses_this_month = target_count

        await db.commit()

        print(f"\n✅ Parse count updated")
        print(f"   Old count: {old_count:,}")
        print(f"   New count: {target_count:,}")
        print(f"   Limit: {user.monthly_limit:,}")
        print(f"   Overage after next parse: {target_count + 1 - user.monthly_limit:,}")

        return True


async def main():
    """Main execution"""
    print("=" * 60)
    print("🧪 Test Subscription Setup for Overage Billing")
    print("=" * 60)

    # Step 1: Create subscription
    print("\n📋 Step 1: Create STANDARD subscription\n")
    success = await setup_test_subscription()

    if not success:
        print("\n❌ Subscription setup failed - stopping")
        return

    # Step 2: Set parse count
    print("\n" + "=" * 60)
    print("📋 Step 2: Set parse count to 99,999\n")

    response = input("Continue to set parse count? (yes/no): ")
    if response.lower() != "yes":
        print("Stopped after subscription creation")
        return

    success = await set_parse_count()

    if success:
        print("\n" + "=" * 60)
        print("✅ Setup complete!")
        print("=" * 60)
        print("\n📝 Next steps:")
        print("   1. Process a CSV with 2+ rows as newaccount@gmail.com")
        print("   2. Verify meter event logged: 'Reported X usage to Stripe'")
        print("   3. Check billing page shows overage warning")
        print("   4. Verify Stripe Dashboard shows meter events")
        print("\n💡 Billing will occur at END of monthly cycle, not daily")
    else:
        print("\n❌ Parse count update failed")


if __name__ == "__main__":
    asyncio.run(main())
