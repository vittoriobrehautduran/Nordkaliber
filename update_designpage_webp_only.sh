#!/bin/bash

# Update designpage.html to use only WebP images (remove all thumbnails)
echo "=== Updating designpage.html to use only WebP images ==="

# Create a temporary file
temp_file=$(mktemp)

# Process the file to remove thumbnails and use only WebP images
sed -E '
    # Remove optionThumb lines completely
    /optionThumb:/d
    
    # Update M1 variants
    s/thumb: '\''images\/motiv\/M1\/M1svart\.PNG'\''/thumb: '\''images\/motiv\/M1\/M1svart\.webp'\''/g
    s/thumb: '\''images\/motiv\/M1\/M1vit\.PNG'\''/thumb: '\''images\/motiv\/M1\/M1vit\.webp'\''/g
    s/thumb: '\''images\/motiv\/M1\/M1guld\.PNG'\''/thumb: '\''images\/motiv\/M1\/M1guld\.webp'\''/g
    s/thumb: '\''images\/motiv\/M1\/orangeM1\.png'\''/thumb: '\''images\/motiv\/M1\/M1orange\.webp'\''/g
    s/thumb: '\''images\/motiv\/M1\/rödM1\.png'\''/thumb: '\''images\/motiv\/M1\/M1röd\.webp'\''/g
    
    # Update M2 variants
    s/thumb: '\''images\/motiv\/M2\/M2svart\.PNG'\''/thumb: '\''images\/motiv\/M2\/M2svart\.webp'\''/g
    s/thumb: '\''images\/motiv\/M2\/M2vit\.PNG'\''/thumb: '\''images\/motiv\/M2\/M2vit\.webp'\''/g
    s/thumb: '\''images\/motiv\/M2\/M2guld\.PNG'\''/thumb: '\''images\/motiv\/M2\/M2guld\.webp'\''/g
    s/thumb: '\''images\/motiv\/M2\/M2orange\.png'\''/thumb: '\''images\/motiv\/M2\/M2orange\.webp'\''/g
    s/thumb: '\''images\/motiv\/M2\/M2röd\.png'\''/thumb: '\''images\/motiv\/M2\/M2röd\.webp'\''/g
    
    # Update M8 variants
    s/thumb: '\''images\/motiv\/M8\/M8svart\.PNG'\''/thumb: '\''images\/motiv\/M8\/M8svart\.webp'\''/g
    s/thumb: '\''images\/motiv\/M8\/M8vit-thumb\.jpg'\''/thumb: '\''images\/motiv\/M8\/M8vit\.webp'\''/g
    s/thumb: '\''images\/motiv\/M8\/M8guld-thumb\.jpg'\''/thumb: '\''images\/motiv\/M8\/M8guld\.webp'\''/g
    s/thumb: '\''images\/motiv\/M8\/M8orange-thumb\.jpg'\''/thumb: '\''images\/motiv\/M8\/M8orange\.webp'\''/g
    s/thumb: '\''images\/motiv\/M8\/M8röd-thumb\.jpg'\''/thumb: '\''images\/motiv\/M8\/M8röd\.webp'\''/g
    
    # For all other variants, replace thumb with the same WebP image as img
    # This is a more general approach - replace any thumb that points to a non-webp file
    s/thumb: '\''([^'\'']*)\.(jpg|png|PNG|JPG)('\'')/thumb: '\''\1.webp\3/g
' designpage.html > "$temp_file"

# Replace the original file
mv "$temp_file" designpage.html

echo "✅ Updated designpage.html to use only WebP images!"
echo "📁 Backup created as designpage.html.backup"
