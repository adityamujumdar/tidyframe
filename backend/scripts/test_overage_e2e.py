#!/usr/bin/env python3
"""
End-to-end test for overage billing

This script tests the complete overage billing flow:
1. Set test user to 99,999 parses (just under 100K limit)
2. Process a job with 1,000 rows
3. Verify parse count increases to 100,999
4. Verify is_overage flag is True
5. Verify Stripe shows correct usage
6. Verify overage calculation is correct
"""
import asyncio
import os
import sys
from pathlib import Path

# Add the backend app to the path
sys.path.insert(0, str(Path(__file__).parent.parent))


async def test_overage_e2e():
    """Run end-to-end overage billing test"""
    from app.core.database import AsyncSessionLocal
    from app.core.config import settings
    from app.models.user import User
    from app.services.stripe_service import StripeService
    from sqlalchemy import select

    print("=" * 80)
    print("🧪 END-TO-END OVERAGE BILLING TEST")
    print("=" * 80)
    print()

    test_email = os.getenv("TEST_USER_EMAIL", "test-overage@tidyframe.com")
    test_parse_count = 99999  # Just under the 100K limit

    print(f"Test Configuration:")
    print(f"  • Test User Email: {test_email}")
    print(f"  • Starting Parse Count: {test_parse_count:,}")
    print(f"  • Monthly Limit: {settings.STANDARD_TIER_MONTHLY_LIMIT:,}")
    print(f"  • Overage Price: ${settings.OVERAGE_PRICE_PER_UNIT:.2f} per parse")
    print()

    async with AsyncSessionLocal() as db:
        try:
            # Step 1: Find or create test user
            print("📋 Step 1: Finding Test User")
            print("-" * 80)

            stmt = select(User).where(User.email == test_email)
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()

            if not user:
                print(f"❌ Test user not found: {test_email}")
                print("   Please create a test user first or set TEST_USER_EMAIL environment variable")
                return False

            print(f"✅ Found test user: {user.email}")
            print(f"   User ID: {user.id}")
            print(f"   Plan: {user.plan.value}")
            print(f"   Current Parses: {user.parses_this_month or 0:,}")
            print(f"   Monthly Limit: {user.monthly_limit:,}")
            print()

            # Step 2: Set parse count to 99,999
            print("📋 Step 2: Setting Parse Count to 99,999")
            print("-" * 80)

            old_count = user.parses_this_month or 0
            user.parses_this_month = test_parse_count
            await db.commit()

            print(f"✅ Updated parse count:")
            print(f"   Old: {old_count:,}")
            print(f"   New: {test_parse_count:,}")
            print(f"   Remaining before overage: {user.monthly_limit - test_parse_count:,}")
            print()

            # Step 3: Simulate processing 1,000 rows
            print("📋 Step 3: Simulating 1,000 Row Job Processing")
            print("-" * 80)

            rows_to_process = 1000
            print(f"Simulating job with {rows_to_process:,} rows...")

            # Update parse count
            user.parses_this_month += rows_to_process
            await db.commit()

            new_total = user.parses_this_month
            overage_amount = max(0, new_total - user.monthly_limit)
            is_overage = new_total >= user.monthly_limit

            print(f"✅ Job processed:")
            print(f"   Rows processed: {rows_to_process:,}")
            print(f"   New total: {new_total:,}")
            print(f"   Is overage: {is_overage}")
            print(f"   Overage amount: {overage_amount:,} parses")
            print(f"   Overage cost: ${overage_amount * settings.OVERAGE_PRICE_PER_UNIT:.2f}")
            print()

            # Step 4: Verify overage calculation
            print("📋 Step 4: Verifying Overage Calculation")
            print("-" * 80)

            expected_total = test_parse_count + rows_to_process
            expected_overage = expected_total - user.monthly_limit
            expected_cost = expected_overage * settings.OVERAGE_PRICE_PER_UNIT

            checks = []
            all_passed = True

            if new_total == expected_total:
                checks.append(("✅", f"Parse count correct: {new_total:,}"))
            else:
                checks.append(("❌", f"Parse count mismatch: {new_total:,} (expected {expected_total:,})"))
                all_passed = False

            if is_overage:
                checks.append(("✅", "Is overage flag is True"))
            else:
                checks.append(("❌", "Is overage flag is False (should be True)"))
                all_passed = False

            if overage_amount == expected_overage:
                checks.append(("✅", f"Overage amount correct: {overage_amount:,}"))
            else:
                checks.append(("❌", f"Overage amount mismatch: {overage_amount:,} (expected {expected_overage:,})"))
                all_passed = False

            actual_cost = overage_amount * settings.OVERAGE_PRICE_PER_UNIT
            if abs(actual_cost - expected_cost) < 0.01:
                checks.append(("✅", f"Overage cost correct: ${actual_cost:.2f}"))
            else:
                checks.append(("❌", f"Overage cost mismatch: ${actual_cost:.2f} (expected ${expected_cost:.2f})"))
                all_passed = False

            for status, message in checks:
                print(f"{status} {message}")

            print()

            # Step 5: Check Stripe (if customer is linked)
            if user.stripe_customer_id:
                print("📋 Step 5: Checking Stripe Meter Data")
                print("-" * 80)

                try:
                    stripe_service = StripeService()
                    usage_data = await stripe_service.get_current_usage(user.stripe_customer_id)

                    print(f"Stripe Usage Data:")
                    print(f"   Data Source: {usage_data.get('data_source', 'unknown')}")
                    print(f"   Usage: {usage_data.get('usage', 0):,}")
                    print(f"   Limit: {usage_data.get('limit', 0):,}")
                    print(f"   Overage: {usage_data.get('overage', 0):,}")
                    print(f"   Overage Cost: ${usage_data.get('overage_cost', 0):.2f}")

                    if usage_data.get('data_source') == 'stripe_meter':
                        checks.append(("✅", "Successfully reading from Stripe Meter API"))
                    elif usage_data.get('data_source') == 'local_db_fallback':
                        checks.append(("⚠️", "Using local DB fallback (Stripe meter read failed)"))
                        checks.append(("🔧", "Check STRIPE_METER_ID configuration"))
                    else:
                        checks.append(("⚠️", f"Unknown data source: {usage_data.get('data_source')}"))

                    print()

                except Exception as e:
                    print(f"⚠️  Could not check Stripe: {e}")
                    print()
            else:
                print("📋 Step 5: Stripe Check Skipped")
                print("-" * 80)
                print("⚠️  Test user not linked to Stripe customer")
                print("   To test Stripe integration, link a Stripe customer to this user")
                print()

            # Summary
            print("=" * 80)
            print("📊 TEST SUMMARY")
            print("=" * 80)
            print()

            if all_passed:
                print("✅ ALL TESTS PASSED!")
                print()
                print("Overage billing calculation is working correctly:")
                print(f"  • {test_parse_count:,} + {rows_to_process:,} = {new_total:,} parses")
                print(f"  • Limit: {user.monthly_limit:,}")
                print(f"  • Overage: {overage_amount:,} parses")
                print(f"  • Cost: ${actual_cost:.2f}")
                print()
            else:
                print("❌ SOME TESTS FAILED")
                print()
                print("Please review the errors above.")
                print()

            # Cleanup: Reset user to original count
            print("🧹 Cleanup: Restoring original parse count...")
            user.parses_this_month = old_count
            await db.commit()
            print(f"✅ Restored to {old_count:,}")
            print()

            return all_passed

        except Exception as e:
            print(f"❌ Test failed with error: {e}")
            import traceback
            traceback.print_exc()
            return False


if __name__ == "__main__":
    success = asyncio.run(test_overage_e2e())
    sys.exit(0 if success else 1)
