import re
import os

file_path = r'c:\Users\abdullah\Desktop\kalimat-alsirr\kalimat-alsirr\src\pages\StagePage.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix < div -> <div
# simple regex for opening tags with space
# Matches < followed by whitespace, then a word char
content_fixed = re.sub(r'<(\s+)(\w+)', r'<\2', content)

# Fix </ div -> </div
# Matches </ followed by whitespace, then a word char
content_fixed = re.sub(r'</(\s+)(\w+)', r'</\2', content_fixed)

# Fix > with preceding space in closing tags like </div > -> </div>
content_fixed = re.sub(r'</(\w+)(\s+)>', r'</\1>', content_fixed)

# Fix opening tags ending with space > like <div > -> <div>
# Be careful not to match <div attr="val" > which is valid but we can clean it too
# But careful with self closing like <br />
content_fixed = re.sub(r'<(\w+)\s+>', r'<\1>', content_fixed)
content_fixed = re.sub(r'</(\w+)\s+>', r'</\1>', content_fixed)

# Fix weird split lines for attributes if any, specifically the one seen in logs
# < div style={{ ... }
# }>
# This is valid JSX if tag is fixed, but let's try to join lines if strictly necessary. 
# For now, just fixing the tag name is likely enough.

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content_fixed)

print("Fixed JSX tags.")
