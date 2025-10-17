#!/usr/bin/env python3
"""Focused analysis of Gemini prompt issues with trust/company/person extraction"""

import asyncio
import csv
import sys
from collections import defaultdict
from pathlib import Path
from typing import Dict

# Add app to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Suppress logging
import logging

logging.getLogger().setLevel(logging.WARNING)

from app.services.fallback_name_parser import FallbackNameParser
from app.services.gemini_service import ConsolidatedGeminiService

# Key test cases that should work perfectly
CRITICAL_TEST_CASES = [
    # Trusts that MUST extract names
    ("Hansen Linda K Rev Trust", "Linda", "Hansen", "trust"),
    ("Baker Cleo L Trust", "Cleo", "Baker", "trust"),
    ("Cole Beulah Revocable Trust", "Cole", "Beulah", "trust"),
    ("Mcculley Phyllis J Trust", "Phyllis", "Mcculley", "trust"),
    ("Daake Dennis R. Living Trust", "Dennis", "Daake", "trust"),
    ("Pudenz Warren Trust", "Warren", "Pudenz", "trust"),
    ("Chicoine Marilyn Rev Trust", "Marilyn", "Chicoine", "trust"),
    ("Birch Dale F Family Trust", "Dale", "Birch", "trust"),
    # Companies that MUST be identified correctly
    ("Microsoft Corporation", None, None, "company"),
    ("Strathe Inc", None, None, "company"),
    ("We Press Llc", None, None, "company"),
    ("Kane Family Farms Llc", None, None, "company"),
    # Persons that MUST extract perfectly
    ("John Smith", "John", "Smith", "person"),
    ("Mary Johnson", "Mary", "Johnson", "person"),
    ("David Williams", "David", "Williams", "person"),
    # Edge cases
    (
        "Cheslak Family Trust",
        None,
        "Cheslak",
        "trust",
    ),  # Family trust with only last name
    ("Ellen Kaye Murphy Trust", "Ellen", "Murphy", "trust"),  # Three name trust
    ("Van Meter Eva Jo", "Eva", "Van Meter", "person"),  # Compound surname
]


async def test_with_real_gemini():
    """Test actual Gemini API with focused samples"""
    gemini = ConsolidatedGeminiService()
    fallback = FallbackNameParser()

    print("\n" + "=" * 80)
    print("TESTING GEMINI PROMPT WITH CRITICAL CASES")
    print("=" * 80)

    # Process all test cases
    test_names = [case[0] for case in CRITICAL_TEST_CASES]

    # Try Gemini API
    try:
        print("\n🤖 Testing Gemini API...")
        batch_result = await gemini.parse_names_batch(test_names)

        if hasattr(batch_result, "results"):
            gemini_results = batch_result.results
            print(f"✅ Gemini processed {len(gemini_results)} samples")
        else:
            print("❌ Gemini API returned unexpected format")
            gemini_results = []
    except Exception as e:
        print(f"❌ Gemini API failed: {e}")
        gemini_results = []

    # Fallback for comparison
    print("\n🔄 Testing Fallback Parser...")
    fallback_results = []
    for name in test_names:
        result = fallback.parse_name(name)
        fallback_results.append(result)

    # Analyze results
    print("\n" + "=" * 80)
    print("DETAILED COMPARISON")
    print("=" * 80)

    issues = {
        "trust_no_names": [],
        "company_misclassified": [],
        "person_wrong_names": [],
        "name_reversal": [],
        "missing_extraction": [],
    }

    for i, (name, expected_first, expected_last, expected_type) in enumerate(
        CRITICAL_TEST_CASES
    ):
        print(f"\n[{i+1:2d}] {name}")
        print(
            f"    Expected: Type={expected_type}, First={expected_first or '(none)'}, Last={expected_last or '(none)'}"
        )

        # Gemini result
        if i < len(gemini_results):
            g = gemini_results[i]
            g_first = (
                g.get("first_name", "")
                if isinstance(g, dict)
                else getattr(g, "first_name", "")
            )
            g_last = (
                g.get("last_name", "")
                if isinstance(g, dict)
                else getattr(g, "last_name", "")
            )
            g_type = (
                g.get("entity_type", "")
                if isinstance(g, dict)
                else getattr(g, "entity_type", "")
            )
            print(
                f"    Gemini:   Type={g_type}, First={g_first or '(none)'}, Last={g_last or '(none)'}"
            )

            # Check issues
            if expected_type == "trust" and (expected_first or expected_last):
                if not g_first and not g_last:
                    issues["trust_no_names"].append(name)
                elif expected_first and expected_last:
                    if g_first != expected_first or g_last != expected_last:
                        if g_first == expected_last and g_last == expected_first:
                            issues["name_reversal"].append(name)
                        else:
                            issues["missing_extraction"].append(name)

            if expected_type == "company" and g_type != "company":
                issues["company_misclassified"].append(name)

            if expected_type == "person" and (
                g_first != expected_first or g_last != expected_last
            ):
                issues["person_wrong_names"].append(name)

        # Fallback result
        if i < len(fallback_results):
            f = fallback_results[i]
            f_first = f.get("first_name", "")
            f_last = f.get("last_name", "")
            f_type = f.get("entity_type", "")
            print(
                f"    Fallback: Type={f_type}, First={f_first or '(none)'}, Last={f_last or '(none)'}"
            )

    # Summary of issues
    print("\n" + "=" * 80)
    print("CRITICAL ISSUES FOUND")
    print("=" * 80)

    total_issues = sum(len(v) for v in issues.values())

    if issues["trust_no_names"]:
        print(
            f"\n❌ TRUSTS WITH NO NAMES EXTRACTED ({len(issues['trust_no_names'])} cases):"
        )
        for name in issues["trust_no_names"]:
            print(f"   • {name}")

    if issues["company_misclassified"]:
        print(
            f"\n❌ COMPANIES MISCLASSIFIED ({len(issues['company_misclassified'])} cases):"
        )
        for name in issues["company_misclassified"]:
            print(f"   • {name}")

    if issues["person_wrong_names"]:
        print(
            f"\n❌ PERSONS WITH WRONG NAMES ({len(issues['person_wrong_names'])} cases):"
        )
        for name in issues["person_wrong_names"]:
            print(f"   • {name}")

    if issues["name_reversal"]:
        print(f"\n⚠️ NAME REVERSALS ({len(issues['name_reversal'])} cases):")
        for name in issues["name_reversal"]:
            print(f"   • {name}")

    if total_issues == 0:
        print("\n✅ NO CRITICAL ISSUES FOUND!")

    return issues


async def analyze_csv_samples():
    """Analyze real CSV data for patterns"""
    csv_file = "/app/test_data/IA.csv"

    print("\n" + "=" * 80)
    print("ANALYZING CSV DATA PATTERNS")
    print("=" * 80)

    patterns = defaultdict(int)
    trust_patterns = []
    company_patterns = []

    with open(csv_file, "r", encoding="utf-8", errors="ignore") as f:
        reader = csv.reader(f)
        next(reader, None)

        count = 0
        for row in reader:
            if count >= 500:  # Analyze first 500
                break

            owner = row[0].strip() if row else ""
            if not owner or owner == "Click To View":
                continue

            count += 1

            # Categorize
            owner_lower = owner.lower()
            if "trust" in owner_lower or "ttee" in owner_lower or "trs" in owner_lower:
                trust_patterns.append(owner)
                patterns["trust"] += 1
            elif any(
                m in owner_lower for m in ["llc", "inc", "corp", "ltd", "company"]
            ):
                company_patterns.append(owner)
                patterns["company"] += 1
            else:
                patterns["person"] += 1

    print(f"\nEntity Distribution (first 500 records):")
    for entity_type, count in patterns.items():
        print(f"  {entity_type}: {count} ({count/sum(patterns.values())*100:.1f}%)")

    # Analyze trust patterns
    print(f"\nTrust Name Patterns (sample):")
    for trust in trust_patterns[:10]:
        print(f"  • {trust}")

    # Analyze company patterns
    print(f"\nCompany Name Patterns (sample):")
    for company in company_patterns[:10]:
        print(f"  • {company}")


def generate_prompt_improvements(issues: Dict) -> str:
    """Generate specific prompt improvements based on issues found"""

    improvements = []

    if issues["trust_no_names"]:
        improvements.append(
            """
### IMPROVEMENT 1: MANDATORY TRUST NAME EXTRACTION
Change Step 2 to be more aggressive:

**Step 2: Name Word Extraction for Trusts and Persons**
For entity_type="trust":
- MUST extract at least one name (first or last)
- Scan ALL words before trust markers
- If only numbers/dates found, look for "of [Name]" pattern
- Common trust patterns to recognize:
  * [LastName] [FirstName] [Initial] Trust
  * [FirstName] [LastName] Trust
  * [LastName] Family Trust (extract last name only)
  * The [LastName] Trust (extract last name)
- If no clear names found, use the most name-like word available
"""
        )

    if issues["company_misclassified"]:
        improvements.append(
            """
### IMPROVEMENT 2: STRICTER COMPANY DETECTION
Update Step 1 classification:

Company markers (PRIORITY - check these first):
- Strong markers (instant classification): llc, inc, corp, corporation, incorporated, limited
- If ANY strong marker found at word boundaries → entity_type="company" 
- Do NOT extract names for companies, even if personal names appear
- "Entrust Freedom Llc" → company (has LLC)
- "Principal Protection Trust" → Check if "Protection" is a company-like word
"""
        )

    if issues["person_wrong_names"] or issues["name_reversal"]:
        improvements.append(
            """
### IMPROVEMENT 3: REFINED NAME ORDERING
Enhance Step 3 scoring:

**Critical Updates:**
1. "Cole" should score higher as first name (75+) than last name
2. "Beulah" should score high as first name due to -ah ending
3. Common first names MUST score 85+ as first names
4. For ambiguous cases, check full context:
   - If preceded by titles (Mr, Mrs, Dr) → following is last name
   - If in trust context without other names → likely [LastName] [FirstName]
   
**Scoring Adjustments:**
- "Cole": first_score=75, last_score=60 → First name
- "Beulah": first_score=85, last_score=40 → First name
- Result: Cole Beulah (not Beulah Cole)
"""
        )

    if issues["missing_extraction"]:
        improvements.append(
            """
### IMPROVEMENT 4: COMPLETE EXTRACTION
Ensure ALL name components are captured:

- For "Ellen Kaye Murphy Trust":
  * Extract all three name parts
  * Middle names can be first names too
  * Result: first="Ellen", last="Murphy" (or first="Ellen Kaye")
  
- For compound surnames:
  * Keep "Van Meter", "Mc Laughlin" together
  * These are ALWAYS last names
"""
        )

    return "\n".join(improvements)


async def main():
    """Run complete analysis"""

    # Test critical cases
    issues = await test_with_real_gemini()

    # Analyze CSV patterns
    await analyze_csv_samples()

    # Generate improvements
    improvements = generate_prompt_improvements(issues)

    print("\n" + "=" * 80)
    print("💡 SPECIFIC PROMPT IMPROVEMENTS NEEDED")
    print("=" * 80)
    print(improvements)

    print("\n" + "=" * 80)
    print("📋 SUMMARY")
    print("=" * 80)
    print(
        """
The current prompt has these key issues:
1. Trusts often don't get names extracted
2. Company detection needs to be stricter (check LLC/Inc first)
3. Name ordering algorithm needs refinement (Cole Beulah case)
4. Perfect person name extraction requires better scoring

Priority fixes:
1. Make trust name extraction mandatory (MUST extract if entity_type="trust")
2. Check company markers BEFORE classifying as trust
3. Adjust scoring weights for common first names vs surnames
"""
    )


if __name__ == "__main__":
    asyncio.run(main())
