import json
import os
import re
from pathlib import Path

import openpyxl


DEFAULT_EXCEL_PATH = r"C:\Users\lenovo\Downloads\宠物冻干零食和猫狗粮产品表 - 恢复ZIWI原图版.xlsx"
ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "sample-products.json"
IMAGE_DIR = ROOT / "public" / "product-images" / "imported"


def slugify(value):
    value = value.lower().replace("&", "and")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")[:90]


def parse_money(value):
    if not value:
        return 0
    match = re.search(r"([0-9]+(?:\.[0-9]+)?)", str(value).replace(",", ""))
    return float(match.group(1)) if match else 0


def parse_variants(price_text, spec_text):
    price_text = str(price_text or "").strip()
    spec_text = str(spec_text or "").strip()

    parts = []
    if ":" in price_text and ";" in price_text:
        for index, item in enumerate(price_text.split(";")):
            if ":" not in item:
                continue
            name, price = item.split(":", 1)
            parts.append(
                {
                    "id": "",
                    "product_id": "",
                    "variant_name": name.strip(),
                    "price": parse_money(price),
                    "sale_price": None,
                    "stock_status": "In Stock",
                    "sort_order": index,
                }
            )

    if not parts:
        variant_name = spec_text if spec_text else "Default"
        parts.append(
            {
                "id": "",
                "product_id": "",
                "variant_name": variant_name,
                "price": parse_money(price_text),
                "sale_price": None,
                "stock_status": "In Stock",
                "sort_order": 0,
            }
        )

    return parts


def unique_slug(base, seen):
    candidate = base or "product"
    index = 2
    while candidate in seen:
        candidate = f"{base}-{index}"
        index += 1
    seen.add(candidate)
    return candidate


def save_images(ws):
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    image_by_row = {}

    for index, image in enumerate(getattr(ws, "_images", []), start=1):
        row_number = image.anchor._from.row + 1
        file_name = f"product-{row_number:03d}-{index:03d}.png"
        path = IMAGE_DIR / file_name
        path.write_bytes(image._data())
        image_by_row[row_number] = f"/product-images/imported/{file_name}"

    return image_by_row


def main():
    excel_path = Path(os.environ.get("PRODUCT_EXCEL_PATH", DEFAULT_EXCEL_PATH))
    wb = openpyxl.load_workbook(excel_path, data_only=True)
    ws = wb["产品表"]
    image_by_row = save_images(ws)
    rows = list(ws.iter_rows(values_only=True))
    headers = list(rows[0])
    seen_slugs = set()
    products = []

    for offset, row in enumerate(rows[1:], start=2):
        if not any(row):
            continue
        item = dict(zip(headers, row))
        name = str(item.get("产品名称") or "").strip()
        if not name:
            continue

        product_id = f"sample-product-{offset:03d}"
        slug = unique_slug(slugify(name), seen_slugs)
        variants = parse_variants(item.get("价格"), item.get("规格"))

        for variant_index, variant in enumerate(variants, start=1):
            variant["id"] = f"{product_id}-variant-{variant_index:02d}"
            variant["product_id"] = product_id

        products.append(
            {
                "id": product_id,
                "name": name,
                "slug": slug,
                "brand": str(item.get("品牌") or "").strip(),
                "category": str(item.get("品类") or "").strip(),
                "pet_type": str(item.get("适用") or "").strip() or None,
                "description": str(item.get("产品描述") or "").strip() or None,
                "image_url": image_by_row.get(offset),
                "source_url": str(item.get("来源链接") or "").strip() or None,
                "is_active": True,
                "product_variants": variants,
            }
        )

    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    DATA_PATH.write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Extracted {len(products)} products to {DATA_PATH}")
    print(f"Extracted images to {IMAGE_DIR}")


if __name__ == "__main__":
    main()
