#!/bin/bash

# SVG to WebP Converter with Transparent Background
# This script converts SVG files to WebP format while preserving transparency

# Function to display usage
usage() {
    echo "Usage: $0 [options] <input_svg> [output_webp]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -q, --quality  Set WebP quality (0-100, default: 90)"
    echo "  -s, --size     Set output size (e.g., 512x512, default: original)"
    echo "  -r, --recursive Convert all SVG files in directory"
    echo ""
    echo "Examples:"
    echo "  $0 input.svg output.webp"
    echo "  $0 -q 95 -s 1024x1024 input.svg"
    echo "  $0 -r images/motiv/M9/"
    echo ""
    echo "If output file is not specified, it will use the same name as input with .webp extension"
}

# Default values
QUALITY=90
SIZE=""
RECURSIVE=false
INPUT_FILE=""
OUTPUT_FILE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -q|--quality)
            QUALITY="$2"
            shift 2
            ;;
        -s|--size)
            SIZE="$2"
            shift 2
            ;;
        -r|--recursive)
            RECURSIVE=true
            shift
            ;;
        -*)
            echo "Unknown option $1"
            usage
            exit 1
            ;;
        *)
            if [[ -z "$INPUT_FILE" ]]; then
                INPUT_FILE="$1"
            elif [[ -z "$OUTPUT_FILE" ]]; then
                OUTPUT_FILE="$1"
            else
                echo "Too many arguments"
                usage
                exit 1
            fi
            shift
            ;;
    esac
done

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
    
    # Check if input file exists
    if [[ ! -f "$input" ]]; then
        echo "Error: Input file '$input' does not exist."
        return 1
    fi
    
    # Check if input is an SVG file
    if [[ ! "$input" =~ \.(svg|SVG)$ ]]; then
        echo "Error: Input file '$input' is not an SVG file."
        return 1
    fi
    
    # Generate output filename if not provided
    if [[ -z "$output" ]]; then
        output="${input%.*}.webp"
    fi
    
    # Create output directory if it doesn't exist
    local output_dir=$(dirname "$output")
    if [[ ! -d "$output_dir" ]]; then
        mkdir -p "$output_dir"
    fi
    
    # Build convert command - input file first, then operations, then output
    local convert_cmd="$MAGICK_CMD \"$input\""
    
    # Add size parameter if specified
    if [[ -n "$SIZE" ]]; then
        convert_cmd="$convert_cmd -resize $SIZE"
    fi
    
    # Add background transparency and quality
    convert_cmd="$convert_cmd -background transparent -quality $QUALITY"
    
    # Add output file
    convert_cmd="$convert_cmd \"$output\""
    
    echo "Converting: $input -> $output"
    echo "Command: $convert_cmd"
    
    # Execute the conversion
    if eval "$convert_cmd"; then
        echo "✓ Successfully converted: $output"
        
        # Show file info
        local file_size=$(ls -lh "$output" | awk '{print $5}')
        echo "  File size: $file_size"
        
        # Check if file has transparency (simplified check)
        local alpha_mean=$($MAGICK_CMD "$output" -alpha extract -format "%[fx:mean]" info: 2>/dev/null)
        if [[ -n "$alpha_mean" ]]; then
            # Use awk for floating point comparison instead of bc
            if awk "BEGIN {exit !($alpha_mean < 0.99)}"; then
                echo "  ✓ Has transparency"
            else
                echo "  ⚠ No transparency detected"
            fi
        fi
        
        return 0
    else
        echo "✗ Failed to convert: $input"
        return 1
    fi
}

# Main execution
if [[ "$RECURSIVE" == true ]]; then
    # Recursive mode
    if [[ -z "$INPUT_FILE" ]]; then
        echo "Error: Input directory required for recursive mode."
        usage
        exit 1
    fi
    
    if [[ ! -d "$INPUT_FILE" ]]; then
        echo "Error: Input '$INPUT_FILE' is not a directory."
        exit 1
    fi
    
    echo "Recursively converting SVG files in: $INPUT_FILE"
    echo "Quality: $QUALITY"
    if [[ -n "$SIZE" ]]; then
        echo "Size: $SIZE"
    fi
    echo ""
    
    # Find all SVG files and convert them
    find "$INPUT_FILE" -name "*.svg" -o -name "*.SVG" | while read -r svg_file; do
        convert_svg_to_webp "$svg_file" ""
    done
    
else
    # Single file mode
    if [[ -z "$INPUT_FILE" ]]; then
        echo "Error: Input file required."
        usage
        exit 1
    fi
    
    convert_svg_to_webp "$INPUT_FILE" "$OUTPUT_FILE"
fi

echo ""
echo "Conversion complete!"
