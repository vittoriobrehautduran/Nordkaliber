#!/bin/bash

# Fix designpage.html to use only WebP images
echo "=== Fixing designpage.html to use only WebP images ==="

# Create a temporary file
temp_file=$(mktemp)

# Process the file with multiple sed commands
sed -E '
    # Remove optionThumb lines completely
    /optionThumb:/d
    
    # Replace all thumb references with corresponding WebP images
    s/thumb: '\''images\/motiv\/M1\/M1svart\.PNG'\''/thumb: '\''images\/motiv\/M1\/M1svart\.webp'\''/g
    s/thumb: '\''images\/motiv\/M1\/M1vit\.PNG'\''/thumb: '\''images\/motiv\/M1\/M1vit\.webp'\''/g
    s/thumb: '\''images\/motiv\/M1\/M1guld\.PNG'\''/thumb: '\''images\/motiv\/M1\/M1guld\.webp'\''/g
    s/thumb: '\''images\/motiv\/M1\/orangeM1\.png'\''/thumb: '\''images\/motiv\/M1\/M1orange\.webp'\''/g
    s/thumb: '\''images\/motiv\/M1\/rödM1\.png'\''/thumb: '\''images\/motiv\/M1\/M1röd\.webp'\''/g
    
    s/thumb: '\''images\/motiv\/M2\/M2svart\.PNG'\''/thumb: '\''images\/motiv\/M2\/M2svart\.webp'\''/g
    s/thumb: '\''images\/motiv\/M2\/M2vit\.PNG'\''/thumb: '\''images\/motiv\/M2\/M2vit\.webp'\''/g
    s/thumb: '\''images\/motiv\/M2\/M2guld\.PNG'\''/thumb: '\''images\/motiv\/M2\/M2guld\.webp'\''/g
    s/thumb: '\''images\/motiv\/M2\/M2orange\.png'\''/thumb: '\''images\/motiv\/M2\/M2orange\.webp'\''/g
    s/thumb: '\''images\/motiv\/M2\/M2röd\.png'\''/thumb: '\''images\/motiv\/M2\/M2röd\.webp'\''/g
    
    s/thumb: '\''images\/motiv\/M8\/M8svart\.PNG'\''/thumb: '\''images\/motiv\/M8\/M8svart\.webp'\''/g
    s/thumb: '\''images\/motiv\/M8\/M8vit-thumb\.jpg'\''/thumb: '\''images\/motiv\/M8\/M8vit\.webp'\''/g
    s/thumb: '\''images\/motiv\/M8\/M8guld-thumb\.jpg'\''/thumb: '\''images\/motiv\/M8\/M8guld\.webp'\''/g
    s/thumb: '\''images\/motiv\/M8\/M8orange-thumb\.jpg'\''/thumb: '\''images\/motiv\/M8\/M8orange\.webp'\''/g
    s/thumb: '\''images\/motiv\/M8\/M8röd-thumb\.jpg'\''/thumb: '\''images\/motiv\/M8\/M8röd\.webp'\''/g
    
    # Replace all other thumb references with WebP versions
    s/thumb: '\''images\/motiv\/[^'\'']*\.jpg'\''/thumb: '\''images\/motiv\/M3\/M3\.webp'\''/g
    s/thumb: '\''images\/motiv\/[^'\'']*\.PNG'\''/thumb: '\''images\/motiv\/M3\/M3\.webp'\''/g
    s/thumb: '\''images\/motiv\/[^'\'']*\.png'\''/thumb: '\''images\/motiv\/M3\/M3\.webp'\''/g
' designpage.html > "$temp_file"

# Replace the original file
mv "$temp_file" designpage.html

echo "✅ Fixed designpage.html to use only WebP images!"
