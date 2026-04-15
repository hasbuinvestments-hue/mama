import os
import django
import sys
import json

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from marketplace.models import Category, Product

def seed_products():
    print("Seeding products...")
    
    products_path = os.path.join(os.path.dirname(__file__), '../mama-fresh-react/src/data/products.json')
    with open(products_path, 'r', encoding='utf-8') as f:
        products_data = json.load(f)

    for item in products_data:
        # Get or create the category
        category_name = item.get('category')
        category, _ = Category.objects.get_or_create(
            name=category_name,
            defaults={'slug': category_name.lower().replace(" ", "-")}
        )

        Product.objects.get_or_create(
            name=item.get('name'),
            defaults={
                'category': category,
                'unit': item.get('unit'),
                'price': item.get('price'),
                'sale_price': item.get('salePrice'),
                'image_url': item.get('imageUrl'),
                'is_top_seller': item.get('topSeller', False)
            }
        )
        print(f"Verified product: {item.get('name')}")

    print("Products seeded successfully!")

if __name__ == "__main__":
    seed_products()
