import re

file_path = r'c:\Users\abdullah\Desktop\kalimat-alsirr\kalimat-alsirr\src\pages\StagePage.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Scanning for missing commas in style objects...")

in_style = False
brace_count = 0
possible_errors = []

for i, line in enumerate(lines):
    line_stripped = line.strip()
    
    # Simple heuristic for style props
    if 'style={{' in line:
        in_style = True
        brace_count = 2 # Starting with {{
        # Check if it closes on the same line
        if '}}' in line and line.count('}}') >= 1:
             # Logic to check balance is complex, skipping single line styles for now unless obvious
             if line_stripped.endswith('}}') or line_stripped.endswith('}}>') or line_stripped.endswith('}} />'):
                 in_style = False
                 continue

    if in_style:
        # Check for property lines: key: value
        # If it doesn't end with comma, and it's not the last line of the object
        # This is a heuristic.
        
        # Check if line looks like a property definition
        if re.match(r'^\s*[a-zA-Z0-9]+:\s*.+', line):
            # If it doesn't end with comma
            if not line_stripped.endswith(',') and not line_stripped.endswith('}}') and not line_stripped.endswith('}}>'):
                # Look ahead to next line
                if i + 1 < len(lines):
                    next_line = lines[i+1].strip()
                    # If next line is a property or closing brace, we might be missing a comma
                    if re.match(r'^[a-zA-Z0-9]+:', next_line) or next_line.startswith("'") or next_line.startswith('"'):
                         possible_errors.append(f"Line {i+1}: Missing comma? -> {line_stripped}")

        if '}}' in line:
            in_style = False

for err in possible_errors:
    print(err)

if not possible_errors:
    print("No obvious missing commas found by heuristic scan.")
