#!/usr/bin/env python3
"""Analyze name patterns to develop heuristics"""

# Sample trust names from the CSV
trust_samples = [
    "Hansen Linda K Rev Trust",
    "Daake Dennis R. Living Trust",
    "Baker Cleo L Trust",
    "Pudenz Warren Trust",
    "Cole Beulah Revocable Trust",
    "Mcculley Phyllis J Trust",
    "Chicoine Marilyn Rev Trust",
    "Glasnapp Wayne R & Maryl Rev Trust",
    "Fry Virgil W Trustee/Revocable Trust",
    "Mills Edwin L & Gloria F Rev Trs",
    "Petersen Mary T Brauch Funnel Trust",
    "Hansen Paul C Revocable Trust",
    "Jensen Darrell G Trust",
    "Musselman Bob Living Trust",
    "Self Joy A. Trust",
    "Petersen Larry E Trust",
]

# Known patterns from analysis
FEMALE_NAMES = {
    "linda",
    "marilyn",
    "phyllis",
    "beulah",
    "maryl",
    "gloria",
    "mary",
    "joy",
}
MALE_NAMES = {
    "dennis",
    "warren",
    "wayne",
    "virgil",
    "edwin",
    "paul",
    "darrell",
    "bob",
    "larry",
}
AMBIGUOUS_NAMES = {"cleo", "hansen", "baker", "cole"}

print("ANALYZING TRUST NAME PATTERNS")
print("=" * 80)

patterns = {
    "likely_lastname_firstname": [],
    "likely_firstname_lastname": [],
    "unclear": [],
}

for name in trust_samples:
    words = name.split()
    if len(words) < 2:
        continue

    first_word = words[0].lower()
    second_word = words[1].lower()

    # Skip middle initials
    if len(second_word) == 1 or second_word.endswith(".") and len(second_word) <= 2:
        if len(words) > 2:
            second_word = words[2].lower()

    analysis = f"{words[0]} {words[1]}"

    # Heuristic 1: Check if second word is clearly a first name
    if second_word in FEMALE_NAMES or second_word in MALE_NAMES:
        patterns["likely_lastname_firstname"].append(f"{analysis} → {name}")
    # Heuristic 2: Check if first word is clearly a first name and second isn't
    elif first_word in FEMALE_NAMES or first_word in MALE_NAMES:
        if second_word not in FEMALE_NAMES and second_word not in MALE_NAMES:
            patterns["likely_firstname_lastname"].append(f"{analysis} → {name}")
        else:
            patterns["unclear"].append(f"{analysis} → {name}")
    else:
        patterns["unclear"].append(f"{analysis} → {name}")

print("\n[LastName] [FirstName] Pattern (likely):")
for p in patterns["likely_lastname_firstname"]:
    print(f"  • {p}")

print(f"\n[FirstName] [LastName] Pattern (likely):")
for p in patterns["likely_firstname_lastname"]:
    print(f"  • {p}")

print(f"\nUnclear Pattern (needs deeper heuristics):")
for p in patterns["unclear"]:
    print(f"  • {p}")

# Summary
total = len(trust_samples)
ln_fn = len(patterns["likely_lastname_firstname"])
fn_ln = len(patterns["likely_firstname_lastname"])
unclear = len(patterns["unclear"])

print("\n" + "=" * 80)
print("INSIGHTS:")
print(f"• LastName FirstName: {ln_fn}/{total} ({ln_fn/total*100:.0f}%)")
print(f"• FirstName LastName: {fn_ln}/{total} ({fn_ln/total*100:.0f}%)")
print(f"• Unclear: {unclear}/{total} ({unclear/total*100:.0f}%)")
print("\n→ Data shows MIXED patterns - cannot hardcode either as default")
print("→ Must use name recognition heuristics to determine order case-by-case")
