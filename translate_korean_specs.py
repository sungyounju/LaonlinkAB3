#!/usr/bin/env python3
"""
Translate Korean text in product specifications to English
Keep MAKER names in Korean but add English translation in parentheses
"""

import json
import re
from datetime import datetime

# Translation mappings for common Korean technical terms
FIELD_TRANSLATIONS = {
    # Common specification fields
    '출력': 'Output',
    '년식': 'Year',
    '사양': 'Specification',
    '사용전압': 'Voltage',
    '사용전원': 'Power Supply',
    '총장(mm)': 'Total Length (mm)',
    '입력 전원': 'Input Power',
    '스트로크': 'Stroke',
    '길이': 'Length',
    '2상': '2 Phase',
    '5상': '5 Phase',
    '감속비': 'Reduction Ratio',
    '센서 길이(약)': 'Sensor Length (approx)',
    '외경 (mm)': 'Outer Diameter (mm)',
    '내경1 (mm)': 'Inner Diameter 1 (mm)',
    '상(Phase)': 'Phase',
    '감속기': 'Reducer',
    '외형 치수': 'External Dimensions',
    'LM블럭 치수': 'LM Block Dimensions',
    '드라이버': 'Driver',
    '스트로크(mm)': 'Stroke (mm)',
    '설명': 'Description',
    '비고': 'Note',
    '블럭 수': 'Block Count',
    '블럭수(EA)': 'Block Count (EA)',
    '블럭수 (EA)': 'Block Count (EA)',
    '브레이크': 'Brake',
    '크기(mm)': 'Size (mm)',
    '행정거리(mm)': 'Stroke Distance (mm)',
    '전원 및 사양': 'Power and Specifications',
    '시리얼': 'Serial',
    '드라이버/시리얼컨버터': 'Driver/Serial Converter',
    '적용모터': 'Applied Motor',
    '길이(mm)': 'Length (mm)',
    '베어링(EA)': 'Bearing (EA)',
    '모터': 'Motor',
    '리드(mm)': 'Lead (mm)',
    '리드': 'Lead',
    '출력(KW)': 'Output (KW)',
    '케이블': 'Cable',
    '동작Condition': 'Operation Condition',
    '감속비(Ratio)': 'Reduction Ratio',
    '적용 Wafer': 'Applied Wafer',
    '전원및 상양': 'Power and Specifications',
    '사이즈(mm)': 'Size (mm)',
    '전원': 'Power',
    '외관 Condition': 'Appearance Condition',
    '동작 여부': 'Operation Status',
    '엔코더케이블': 'Encoder Cable',
    '조명': 'Lighting',
    '렌즈 아답터': 'Lens Adapter',
    '레일길이(mm)': 'Rail Length (mm)',
    '전압': 'Voltage',
    '특징': 'Features',
    '배율렌즈': 'Magnification Lens',
    '렌즈회전': 'Lens Rotation',
    '스트로크 X': 'Stroke X',
    '티칭팬던트': 'Teaching Pendant',
    '알파스텝지원': 'Alpha Step Support',
    '47각': '47 Angle',
    '기타': 'Other',
    '화이버센서': 'Fiber Sensor',
    '상세스펙': 'Detailed Specs',
    'CCD카메라': 'CCD Camera',
    '드라이버(X,Y)': 'Driver (X,Y)',
    '모터(X,Y)': 'Motor (X,Y)',
    '조명+렌즈': 'Lighting + Lens',
    '브레이크타입': 'Brake Type',
    '입력': 'Input',
    'A:총길이(mm)': 'A: Total Length (mm)',
    'B:스크류길이(mm)': 'B: Screw Length (mm)',
    'A:총 길이(mm)': 'A: Total Length (mm)',
    'A;총 길이(mm)': 'A: Total Length (mm)',
    'B:레일 폭(mm)': 'B: Rail Width (mm)',
    'A:레일 총\n길이(mm)': 'A: Rail Total Length (mm)',
    'A:레일 총   \n길이(mm)': 'A: Rail Total Length (mm)',
    'A:레일 총   \n 길이(mm)': 'A: Rail Total Length (mm)',
    'A:레일 총    \n 길이(mm)': 'A: Rail Total Length (mm)',
    'X-Axis(주행축)': 'X-Axis (Travel Axis)',
}

# Value translations for Korean content in values
VALUE_TRANSLATIONS = {
    '볼스크류': 'Ball Screw',
    '기본베이스 입출력 모듈 6Pcs  장착 가능': 'Basic base I/O module, 6pcs mountable',
    '없음': 'None',
    '있음': 'Yes',
    '양호': 'Good',
    '보통': 'Normal',
    '우수': 'Excellent',
    '사용가능': 'Usable',
    '신품': 'New',
    '중고': 'Used',
    '미사용': 'Unused',
    '미상': 'Unknown',
    'Unused 새제품': 'Unused (New Product)',
    'Unused 박스': 'Unused (Boxed)',

    # Classification translations
    '노이즈 필터': 'Noise Filter',
    'AC모터,기어드모터 감속기': 'AC Motor, Geared Motor Reducer',
    'AIR 실린더(가이드형)': 'AIR Cylinder (Guided Type)',
    '솔레노이드밸브': 'Solenoid Valve',
    '컨트롤러': 'Controller',
    'AC모터,기어드모터': 'AC Motor, Geared Motor',
    'AC모터 감속기': 'AC Motor Reducer',
    '센서': 'Sensor',
    '인버터': 'Inverter',
    '통신모듈': 'Communication Module',
    'AC모터': 'AC Motor',
    '1축 엑츄에이터': 'Single-Axis Actuator',
    'LM가이드': 'LM Guide',
    'LM 가이드': 'LM Guide',
    'AIR 실린더(회전ROTARY)': 'AIR Cylinder (Rotary)',
    'AREA SENSOR 센서': 'AREA Sensor',
    '카메라': 'Camera',
    '모터': 'Motor',
    '드라이버': 'Driver',
    '광파이버 센서': 'Fiber Optic Sensor',
    '근접센서': 'Proximity Sensor',
    '광전센서': 'Photoelectric Sensor',
    '압력센서': 'Pressure Sensor',
    '레이저센서': 'Laser Sensor',
    'DC모터': 'DC Motor',
    '브레이크': 'Brake',
    '케이블': 'Cable',
    '커넥터': 'Connector',
    '스위치': 'Switch',
    '릴레이': 'Relay',
    '전원공급장치': 'Power Supply',
    '변압기': 'Transformer',
    '접촉기': 'Contactor',
    '차단기': 'Circuit Breaker',
    '퓨즈': 'Fuse',
    'AIR 실린더': 'Air Cylinder',
    '실린더': 'Cylinder',
    '밸브': 'Valve',
    '진공발생기': 'Vacuum Generator',
    '진공패드': 'Vacuum Pad',
    '에어필터': 'Air Filter',
    '레귤레이터': 'Regulator',
    '윤활장치': 'Lubricator',
    '매니폴드': 'Manifold',
    '그리퍼': 'Gripper',
    '로봇핸드': 'Robot Hand',
    '리니어부시': 'Linear Bushing',
    '볼 부시': 'Ball Bushing',
    '리니어베어링': 'Linear Bearing',
    '슬라이드테이블': 'Slide Table',
    'XY테이블': 'XY Table',
    '리니어액츄에이터': 'Linear Actuator',
    '전동실린더': 'Electric Cylinder',
    '터치패널': 'Touch Panel',
    '표시기': 'Display',
    '계측기': 'Measuring Instrument',
    '로봇': 'Robot',
    '조명': 'Lighting',
    '렌즈': 'Lens',
    '비전시스템': 'Vision System',
}

# Maker name translations (English names in parentheses)
# Format: Korean name -> English translation
MAKER_TRANSLATIONS = {
    '오리엔탈모터': 'Oriental Motor',
    '한국오므론': 'Korea Omron',
    '엘에스산전': 'LS Electric',
    '파나소닉': 'Panasonic',
    '미쓰비시': 'Mitsubishi',
    '야스카와': 'Yaskawa',
    '도시바': 'Toshiba',
    '후지전기': 'Fuji Electric',
    '산요전기': 'Sanyo Denki',
    '니혼펄스': 'Nihon Pulse',
}

def translate_spec_field(field_name):
    """Translate Korean field name to English"""
    # Check exact match first
    if field_name in FIELD_TRANSLATIONS:
        return FIELD_TRANSLATIONS[field_name]

    # Return as-is if already in English or unknown
    return field_name

def translate_spec_value(value):
    """Translate Korean value to English where applicable"""
    value_str = str(value)

    # Check for exact matches
    for korean, english in VALUE_TRANSLATIONS.items():
        if korean in value_str:
            value_str = value_str.replace(korean, english)

    return value_str

def translate_specifications(specs_str):
    """Translate Korean text in specifications JSON string"""
    if not specs_str or specs_str == '{}':
        return specs_str

    try:
        specs = json.loads(specs_str)
        translated_specs = {}

        for key, value in specs.items():
            # Translate field name
            new_key = translate_spec_field(key)

            # Translate value
            if key == 'MAKER':
                # For MAKER: if Korean, add English in parentheses
                if re.search(r'[\uac00-\ud7af]', value):
                    # Check if we have a translation
                    if value in MAKER_TRANSLATIONS:
                        new_value = f"{value} ({MAKER_TRANSLATIONS[value]})"
                    else:
                        # Keep as-is if no translation available
                        new_value = value
                else:
                    # Already in English, keep as-is
                    new_value = value
            else:
                # Translate other values
                new_value = translate_spec_value(value)

            translated_specs[new_key] = new_value

        return json.dumps(translated_specs, ensure_ascii=False)

    except json.JSONDecodeError:
        print(f"Warning: Could not parse specification: {specs_str}")
        return specs_str
    except Exception as e:
        print(f"Warning: Error processing specification: {e}")
        return specs_str

def fix_products_file(input_file):
    """Fix Korean text in products-data.js"""

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

    # Translate specifications
    translated_count = 0
    for product in products:
        if 'specifications' in product and product['specifications']:
            original = product['specifications']
            translated = translate_specifications(original)
            if translated != original:
                product['specifications'] = translated
                translated_count += 1

    print(f"Translated {translated_count} product specifications")

    # Reconstruct the JavaScript file
    header_match = re.search(r'^(.*?)const productsData = ', content, re.DOTALL)
    header = header_match.group(1) if header_match else ""

    # Update the generation timestamp
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
    print(f"Writing translated data to: {input_file}")
    with open(input_file, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("Done!")
    print(f"\nTranslated {translated_count} out of {len(products)} products")

    # Show some examples
    print("\n" + "="*60)
    print("EXAMPLE TRANSLATIONS (first 5 with Korean text):")
    print("="*60)
    count = 0
    for product in products:
        if count >= 5:
            break
        if product.get('specifications'):
            # Check if originally had Korean
            if re.search(r'[\uac00-\ud7af]', product.get('specifications', '')):
                continue  # Skip if still has Korean (wasn't in our translation dict)
            specs = json.loads(product['specifications'])
            # Check if has our translated fields
            if any(field in specs for field in ['Output', 'Description', 'Voltage', 'Ball Screw']):
                print(f"\nProduct ID: {product['id']}")
                print(f"Specifications: {product['specifications'][:200]}")
                count += 1

if __name__ == "__main__":
    input_file = "js/products-data.js"
    fix_products_file(input_file)
