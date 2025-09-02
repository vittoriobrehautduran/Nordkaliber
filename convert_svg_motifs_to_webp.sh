#!/bin/bash

# Convert specific SVG motif files to WebP with transparent backgrounds
# This script converts M3, M4, M7, M10 SVG files to WebP format

echo "=== Converting SVG Motif files to WebP with Transparent Background ==="
echo ""

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick (magick or convert command) is not installed."
    echo "Please install ImageMagick to use this script."
    exit 1
fi

# Determine which ImageMagick command to use
if command -v magick &> /dev/null; then
    MAGICK_CMD="magick"
else
    MAGICK_CMD="convert"
fi

# Function to convert a single SVG file
convert_svg_to_webp() {
    local input="$1"
    local output="$2"
    local backup="${input}.backup"
    
    echo "Processing: $input"
    
    # Check if input file exists
    if [[ ! -f "$input" ]]; then
        echo "  ⚠ File not found: $input"
        return 1
    fi
    
    # Create backup of original file if it doesn't exist
    if [[ ! -f "$backup" ]]; then
        cp "$input" "$backup"
        echo "  ✓ Created backup: $backup"
    else
        echo "  ℹ Backup already exists: $backup"
    fi
    
    # Convert to WebP with transparent background
    echo "  Converting to WebP..."
    if $MAGICK_CMD "$input" -background transparent -quality 90 "$output"; then
        echo "  ✓ Successfully converted: $output"
        
        # Show file info
        local original_size=$(ls -lh "$input" | awk '{print $5}')
        local webp_size=$(ls -lh "$output" | awk '{print $5}')
        echo "  📊 Original: $original_size → WebP: $webp_size"
        
        # Check transparency
        local alpha_mean=$($MAGICK_CMD "$output" -alpha extract -format "%[fx:mean]" info: 2>/dev/null)
        if [[ -n "$alpha_mean" ]]; then
            if awk "BEGIN {exit !($alpha_mean < 0.99)}"; then
                echo "  ✓ Has transparency"
            else
                echo "  ⚠ No transparency detected"
            fi
        fi
        
        return 0
    else
        echo "  ✗ Failed to convert: $input"
        return 1
    fi
}

# Define the SVG files to convert
svg_files=(
    "images/motiv/M3/M3.svg"
    "images/motiv/M4/M4.svg"
    "images/motiv/M7/M7.svg"
    "images/motiv/M10/M10.svg"
)

echo "Converting the following SVG files to WebP:"
for file in "${svg_files[@]}"; do
    echo "  - $file"
done
echo ""

# Convert each file
success_count=0
total_count=${#svg_files[@]}

for file in "${svg_files[@]}"; do
    echo "---"
    if convert_svg_to_webp "$file" ""; then
        ((success_count++))
    fi
    echo ""
done

echo "=== Conversion Summary ==="
echo "Total files: $total_count"
echo "Successful conversions: $success_count"
echo "Failed conversions: $((total_count - success_count))"

if [[ $success_count -eq $total_count ]]; then
    echo "🎉 All conversions completed successfully!"
else
    echo "⚠ Some conversions failed. Check the output above for details."
fi

echo ""
echo "Note: Original SVG files have been backed up with .backup extension"
echo "New WebP files are ready to use with transparent backgrounds!"
