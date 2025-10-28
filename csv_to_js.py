#!/usr/bin/env python3
"""
Convert CSV product data to JavaScript for website
"""

import pandas as pd
import json
import os
import sys
from pathlib import Path

def csv_to_js(csv_file, output_dir='website_solution/js'):
    """Convert CSV file to JavaScript data file for website"""
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Read CSV file
    print(f"Reading CSV file: {csv_file}")
    df = pd.read_csv(csv_file)
    
    # Clean and prepare data
    df = df.fillna('')
    
    # Convert to dictionary format
    products = []
    categories = {}
    manufacturers = set()
    
    for _, row in df.iterrows():
        product = {
            'id': str(row.get('product_id', '')),
            'name_kr': row.get('name_kr', ''),
            'name_en': row.get('name_en', ''),
            'price_krw': float(row.get('price_krw', 0)) if row.get('price_krw') else 0,
            'price_eur': float(row.get('price_eur', 0)) if row.get('price_eur') else 0,
            'price_eur_markup': float(row.get('price_eur_markup', 0)) if row.get('price_eur_markup') else 0,
            'model_number': row.get('model_number', ''),
            'manufacturer': row.get('manufacturer', ''),
            'category_main_kr': row.get('category_main_kr', ''),
            'category_main_en': row.get('category_main_en', ''),
            'category_sub_kr': row.get('category_sub_kr', ''),
            'category_sub_en': row.get('category_sub_en', ''),
            'category_subsub_kr': row.get('category_subsub_kr', ''),
            'category_subsub_en': row.get('category_subsub_en', ''),
            'specifications': row.get('specifications', ''),
            'images': row.get('images', '').split(',') if row.get('images') else [],
            'url': row.get('url', ''),
            'scraped_at': row.get('scraped_at', '')
        }
        
        products.append(product)
        
        # Build category hierarchy
        main_cat = row.get('category_main_en', '')
        sub_cat = row.get('category_sub_en', '')
        subsub_cat = row.get('category_subsub_en', '')
        
        if main_cat:
            if main_cat not in categories:
                categories[main_cat] = {
                    'name_kr': row.get('category_main_kr', ''),
                    'name_en': main_cat,
                    'subcategories': {}
                }
            
            if sub_cat:
                if sub_cat not in categories[main_cat]['subcategories']:
                    categories[main_cat]['subcategories'][sub_cat] = {
                        'name_kr': row.get('category_sub_kr', ''),
                        'name_en': sub_cat,
                        'subcategories': {}
                    }
                
                if subsub_cat:
                    categories[main_cat]['subcategories'][sub_cat]['subcategories'][subsub_cat] = {
                        'name_kr': row.get('category_subsub_kr', ''),
                        'name_en': subsub_cat
                    }
        
        # Collect manufacturers
        if row.get('manufacturer'):
            manufacturers.add(row.get('manufacturer'))
    
    # Generate JavaScript file
    js_content = f"""// Product Data - Generated from CSV
// Total Products: {len(products)}
// Generated: {pd.Timestamp.now()}

const productsData = {json.dumps(products, ensure_ascii=False, indent=2)};

const categoriesData = {json.dumps(categories, ensure_ascii=False, indent=2)};

const manufacturersData = {json.dumps(sorted(list(manufacturers)), ensure_ascii=False, indent=2)};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {{
    module.exports = {{ productsData, categoriesData, manufacturersData }};
}}
"""
    
    # Save JavaScript file
    js_file = os.path.join(output_dir, 'products-data.js')
    with open(js_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"JavaScript data file created: {js_file}")
    
    # Generate statistics
    print("\n" + "="*50)
    print("CONVERSION STATISTICS")
    print("="*50)
    print(f"Total products: {len(products)}")
    print(f"Main categories: {len(categories)}")
    print(f"Manufacturers: {len(manufacturers)}")
    print(f"Products with images: {sum(1 for p in products if p['images'])}")
    print(f"Products with prices: {sum(1 for p in products if p['price_eur_markup'] > 0)}")
    print("="*50)
    
    # Create image directory structure
    images_dir = os.path.join(os.path.dirname(output_dir), 'images', 'products')
    os.makedirs(images_dir, exist_ok=True)
    
    print(f"\nNote: Copy your product images to: {images_dir}")
    
    return js_file

def main():
    if len(sys.argv) < 2:
        print("Usage: python csv_to_js.py <csv_file>")
        print("Example: python csv_to_js.py shmarket_products.csv")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    
    if not os.path.exists(csv_file):
        print(f"Error: CSV file '{csv_file}' not found")
        sys.exit(1)
    
    csv_to_js(csv_file)

if __name__ == "__main__":
    main()
