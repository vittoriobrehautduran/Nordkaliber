#!/usr/bin/env python3

# Read the file
with open('designpage.html', 'r') as f:
    content = f.read()

# Replace all PNG and JPG extensions with webp
content = content.replace('.PNG', '.webp')
content = content.replace('.png', '.webp')
content = content.replace('.jpg', '.webp')
content = content.replace('.JPG', '.webp')

# Write back to file
with open('designpage.html', 'w') as f:
    f.write(content)

print('Successfully updated all image extensions to .webp')
