#!/bin/bash

# Fix WebP transparency to be 100% transparent like PNG
# This script recreates WebP files with proper transparency

echo "=== Fixing WebP Transparency ==="
echo ""

# Function to fix transparency for a single file
fix_transparency() {
    local input="$1"
    local output="$2"
    
    echo "Processing: $input"
    
    # Method 1: Try to remove background and make transparent
    magick "$input" -fuzz 15% -transparent white -fuzz 15% -transparent "#FFFFFF" -fuzz 15% -transparent "#FEFEFE" -fuzz 15% -transparent "#FDFDFD" -quality 90 "$output"
    
    # Check if this improved transparency
    local transparency=$(magick "$output" -alpha extract -format "%[fx:mean]" info:)
    echo "  Transparency after white removal: $transparency"
    
    # If still not transparent enough, try a different approach
    if (( $(echo "$transparency > 0.01" | bc -l) )); then
        echo "  Trying alternative method..."
        # Method 2: Use alpha channel manipulation
        magick "$input" -channel alpha -threshold 50% -quality 90 "$output"
        
        local new_transparency=$(magick "$output" -alpha extract -format "%[fx:mean]" info:)
        echo "  Transparency after alpha threshold: $new_transparency"
    fi
}

# Fix M2
fix_transparency "images/motiv/M2/M2.png" "images/motiv/M2/M2_fixed.webp"

# Fix M3
fix_transparency "images/motiv/M3/M3.svg" "images/motiv/M3/M3_fixed.webp"

# Fix M4
fix_transparency "images/motiv/M4/M4.svg" "images/motiv/M4/M4_fixed.webp"

# Fix M7
fix_transparency "images/motiv/M7/M7.svg" "images/motiv/M7/M7_fixed.webp"

# Fix M10
fix_transparency "images/motiv/M10/M10.svg" "images/motiv/M10/M10_fixed.webp"

echo ""
echo "=== Final Transparency Check ==="
echo "M2_fixed.webp: $(magick images/motiv/M2/M2_fixed.webp -alpha extract -format "%[fx:mean]" info:)"
echo "M3_fixed.webp: $(magick images/motiv/M3/M3_fixed.webp -alpha extract -format "%[fx:mean]" info:)"
echo "M4_fixed.webp: $(magick images/motiv/M4/M4_fixed.webp -alpha extract -format "%[fx:mean]" info:)"
echo "M7_fixed.webp: $(magick images/motiv/M7/M7_fixed.webp -alpha extract -format "%[fx:mean]" info:)"
echo "M10_fixed.webp: $(magick images/motiv/M10/M10_fixed.webp -alpha extract -format "%[fx:mean]" info:)"

echo ""
echo "✅ Fixed WebP files created with improved transparency!"
