#!/usr/bin/env python3
"""Analyze name ordering patterns in CSV to develop better heuristics"""

import csv
from collections import Counter

# Common first names and surnames for analysis
COMMON_FIRST_NAMES = {
    'linda', 'dennis', 'judy', 'wallace', 'margaret', 'marilyn', 'cleo', 'warren',
    'russell', 'wayne', 'beulah', 'phyllis', 'dale', 'virgil', 'edwin', 'gloria',
    'mary', 'timothy', 'karen', 'paul', 'bob', 'andrea', 'marianne', 'retha',
    'james', 'larry', 'michael', 'jolene', 'joy'
}

COMMON_SURNAMES = {
    'hansen', 'baker', 'mills', 'evans', 'petersen', 'jensen', 'long', 'richardson',
    'smith', 'johnson', 'brown', 'davis', 'miller', 'wilson', 'moore', 'taylor'
}

def analyze_trust_patterns(file_path):
    """Analyze trust name patterns to detect common ordering"""
    
    patterns = {
        'lastname_firstname': [],
        'firstname_lastname': [],
        'ambiguous': []
    }
    
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.reader(f)
        next(reader)  # Skip header
        
        count = 0
        for row in reader:
            if count >= 200:
                break
                
            name = row[4] if len(row) > 4 else ""
            if not name or 'trust' not in name.lower():
                continue
                
            # Extract first two words (potential names)
            words = name.split()
            if len(words) < 2:
                continue
                
            first_word = words[0].lower().strip('.,')
            second_word = words[1].lower().strip('.,')
            
            # Skip if either is a middle initial
            if len(first_word) == 1 or len(second_word) == 1:
                continue
            
            count += 1
            
            # Analyze pattern
            first_is_firstname = first_word in COMMON_FIRST_NAMES
            first_is_surname = first_word in COMMON_SURNAMES
            second_is_firstname = second_word in COMMON_FIRST_NAMES
            second_is_surname = second_word in COMMON_SURNAMES
            
            if first_is_surname and second_is_firstname and not first_is_firstname:
                patterns['lastname_firstname'].append(f"{words[0]} {words[1]} - {name[:50]}")
            elif first_is_firstname and second_is_surname and not second_is_firstname:
                patterns['firstname_lastname'].append(f"{words[0]} {words[1]} - {name[:50]}")
            else:
                # Check for female name indicators
                if second_word.endswith(('a', 'y', 'ie', 'ine', 'elle')):
                    patterns['lastname_firstname'].append(f"{words[0]} {words[1]} - {name[:50]} [female ending]")
                elif first_word.endswith(('a', 'y', 'ie', 'ine', 'elle')):
                    patterns['firstname_lastname'].append(f"{words[0]} {words[1]} - {name[:50]} [female ending]")
                else:
                    patterns['ambiguous'].append(f"{words[0]} {words[1]} - {name[:50]}")
    
    return patterns

# Analyze the Iowa CSV
file_path = "/home/aditya/dev/tidyframe/tests/Greater than 10 miles, corn and beans, other, IA.csv"
patterns = analyze_trust_patterns(file_path)

print("NAME ORDERING ANALYSIS")
print("=" * 80)

print(f"\n[LastName] [FirstName] Pattern: {len(patterns['lastname_firstname'])} cases")
for example in patterns['lastname_firstname'][:5]:
    print(f"  • {example}")

print(f"\n[FirstName] [LastName] Pattern: {len(patterns['firstname_lastname'])} cases")
for example in patterns['firstname_lastname'][:5]:
    print(f"  • {example}")

print(f"\nAmbiguous Pattern: {len(patterns['ambiguous'])} cases")
for example in patterns['ambiguous'][:5]:
    print(f"  • {example}")

# Calculate percentages
total = sum(len(v) for v in patterns.values())
if total > 0:
    print("\n" + "=" * 80)
    print("DISTRIBUTION:")
    print(f"LastName FirstName: {len(patterns['lastname_firstname'])/total*100:.1f}%")
    print(f"FirstName LastName: {len(patterns['firstname_lastname'])/total*100:.1f}%")
    print(f"Ambiguous: {len(patterns['ambiguous'])/total*100:.1f}%")
    
    print("\nKEY INSIGHT:")
    if len(patterns['lastname_firstname']) > len(patterns['firstname_lastname']):
        print("→ Data shows preference for [LastName] [FirstName] pattern in property records")
    else:
        print("→ Data shows mixed patterns - need strong heuristics to determine order")