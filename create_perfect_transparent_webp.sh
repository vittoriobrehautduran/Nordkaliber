#!/bin/bash

# Create WebP files with perfect transparency using mask method
echo "=== Creating Perfect Transparent WebP Files ==="
echo ""

# Function to create perfect transparent WebP
create_perfect_transparent() {
    local input="$1"
    local output="$2"
    local name=$(basename "$input" .png)
    local dir=$(dirname "$input")
    
    echo "Processing: $input"
    
    # Create mask
    magick "$input" -alpha extract -threshold 0% -negate "${dir}/${name}_mask.png"
    
    # Apply mask for perfect transparency
    magick "$input" "${dir}/${name}_mask.png" -alpha off -compose copyopacity -composite -quality 90 "$output"
    
    # Check transparency
    local transparency=$(magick "$output" -alpha extract -format "%[fx:mean]" info:)
    echo "  Transparency: $transparency"
    
    # Clean up mask
    rm "${dir}/${name}_mask.png"
}

# Create perfect transparent WebP for all motif files
create_perfect_transparent "images/motiv/M2/M2.png" "images/motiv/M2/M2.webp"
create_perfect_transparent "images/motiv/M3/M3.svg" "images/motiv/M3/M3.webp"
create_perfect_transparent "images/motiv/M4/M4.svg" "images/motiv/M4/M4.webp"
create_perfect_transparent "images/motiv/M7/M7.svg" "images/motiv/M7/M7.webp"
create_perfect_transparent "images/motiv/M10/M10.svg" "images/motiv/M10/M10.webp"

echo ""
echo "=== Final Transparency Check ==="
echo "M2.webp: $(magick images/motiv/M2/M2.webp -alpha extract -format "%[fx:mean]" info:)"
echo "M3.webp: $(magick images/motiv/M3/M3.webp -alpha extract -format "%[fx:mean]" info:)"
echo "M4.webp: $(magick images/motiv/M4/M4.webp -alpha extract -format "%[fx:mean]" info:)"
echo "M7.webp: $(magick images/motiv/M7/M7.webp -alpha extract -format "%[fx:mean]" info:)"
echo "M10.webp: $(magick images/motiv/M10/M10.webp -alpha extract -format "%[fx:mean]" info:)"

echo ""
echo "✅ Perfect transparent WebP files created!"
