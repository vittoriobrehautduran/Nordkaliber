#!/bin/bash

# Convert all motif PNG files to WebP with transparent backgrounds
# This script will:
# 1. Rename original PNG files to .png.backup
# 2. Convert them to WebP with transparent background
# 3. Create new .webp files

echo "=== Converting Motif PNG files to WebP with Transparent Background ==="
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

# Function to convert a single PNG file
convert_png_to_webp() {
    local input="$1"
    local output="${input%.*}.webp"
    local backup="${input}.backup"
    
    echo "Processing: $input"
    
    # Check if input file exists
    if [[ ! -f "$input" ]]; then
        echo "  ⚠ File not found: $input"
        return 1
    fi
    
    # Create backup of original file
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

# Find all motif PNG files
echo "Finding motif PNG files..."
motif_files=($(find images/motiv/ -name "*.png" -o -name "*.PNG" | grep -E "M[0-9]+\.(png|PNG)$" | sort))

if [[ ${#motif_files[@]} -eq 0 ]]; then
    echo "No motif PNG files found."
    exit 0
fi

echo "Found ${#motif_files[@]} motif PNG files:"
for file in "${motif_files[@]}"; do
    echo "  - $file"
done
echo ""

# Convert each file
success_count=0
total_count=${#motif_files[@]}

for file in "${motif_files[@]}"; do
    echo "---"
    if convert_png_to_webp "$file"; then
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
echo "Note: Original PNG files have been backed up with .backup extension"
echo "New WebP files are ready to use with transparent backgrounds!"
