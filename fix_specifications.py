#!/usr/bin/env python3
"""
Fix specification mappings in products-data.js
The specifications have misaligned key-value pairs that need to be corrected.
"""

import json
import re
from datetime import datetime

def fix_specification_mapping(spec_str):
    """
    Fix the misaligned specification key-value pairs.

    Original problem:
    {"MAKER": "Classification", "MITSUBISHI": "PLC", "Condition": "SERIAL", "A-Level": "..."}

    Should be:
    {"MAKER": "MITSUBISHI", "Classification": "PLC", "Condition": "A-Level", "SERIAL": "..."}

    The pattern is that pairs are shifted:
    - items[0] = ("MAKER", "Classification") and items[1] = ("MITSUBISHI", "PLC")
      should become: "MAKER": "MITSUBISHI" and "Classification": "PLC"
    - items[2] = ("Condition", "SERIAL") and items[3] = ("A-Level", "...")
      should become: "Condition": "A-Level" and "SERIAL": "..."
    """
    if not spec_str or spec_str == '{}':
        return spec_str

    try:
        specs = json.loads(spec_str)
        fixed_specs = {}

        # Convert to list of key-value pairs
        items = list(specs.items())

        if len(items) == 0:
            return spec_str

        # Check if this follows the MAKER pattern (most common case)
        if 'MAKER' in specs and len(items) >= 2:
            # Process pairs (0,1), (2,3), (4,5), etc.
            for i in range(0, len(items) - 1, 2):
                curr_key = items[i][0]      # e.g., "MAKER"
                curr_val = items[i][1]      # e.g., "Classification"
                next_key = items[i+1][0]    # e.g., "MITSUBISHI"
                next_val = items[i+1][1]    # e.g., "PLC"

                # Create the fixed mappings
                fixed_specs[curr_key] = next_key   # "MAKER": "MITSUBISHI"
                fixed_specs[curr_val] = next_val   # "Classification": "PLC"

            # Handle odd number of items (last item stays as is)
            if len(items) % 2 == 1:
                last_item = items[-1]
                fixed_specs[last_item[0]] = last_item[1]

            return json.dumps(fixed_specs, ensure_ascii=False)

        # If pattern doesn't match, return original
        return spec_str

    except json.JSONDecodeError:
        print(f"Warning: Could not parse specification: {spec_str}")
        return spec_str
    except Exception as e:
        print(f"Warning: Error processing specification: {e}")
        return spec_str


def fix_products_data_file(input_file):
    """Fix the products-data.js file"""

    print(f"Reading file: {input_file}")
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the productsData array
    products_match = re.search(r'const productsData = (\[.*?\]);', content, re.DOTALL)
    if not products_match:
        print("Error: Could not find productsData array")
        return

    products_json = products_match.group(1)
    products = json.loads(products_json)

    print(f"Found {len(products)} products")

    # Fix each product's specifications
    fixed_count = 0
    for product in products:
        if 'specifications' in product and product['specifications']:
            original = product['specifications']
            fixed = fix_specification_mapping(original)
            if fixed != original:
                product['specifications'] = fixed
                fixed_count += 1

    print(f"Fixed {fixed_count} product specifications")

    # Reconstruct the JavaScript file
    # Extract everything before productsData
    header_match = re.search(r'^(.*?)const productsData = ', content, re.DOTALL)
    header = header_match.group(1) if header_match else ""

    # Update the generation timestamp in header
    header = re.sub(
        r'// Generated: .*',
        f'// Generated: {datetime.now()}',
        header
    )

    # Extract everything after productsData
    footer_match = re.search(r'const productsData = \[.*?\];(.*)$', content, re.DOTALL)
    footer = footer_match.group(1) if footer_match else ""

    # Reconstruct
    new_content = (
        header +
        f"const productsData = {json.dumps(products, ensure_ascii=False, indent=2)};" +
        footer
    )

    # Write back
    output_file = input_file
    print(f"Writing fixed data to: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("Done!")
    print(f"\nFixed {fixed_count} out of {len(products)} products")

    # Show some examples
    print("\n" + "="*60)
    print("EXAMPLE FIXES (first 3):")
    print("="*60)
    for i, product in enumerate(products[:3]):
        if product.get('specifications'):
            print(f"\nProduct ID: {product['id']}")
            print(f"Specifications: {product['specifications'][:200]}...")


if __name__ == "__main__":
    input_file = "js/products-data.js"
    fix_products_data_file(input_file)
