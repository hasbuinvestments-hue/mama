"""
Mama Fresh — Master Seed Script
Run once after migrations: python seed.py
"""
import os, sys, django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.utils.text import slugify
from marketplace.models import (
    SiteConfig, Category, Product, TownCoordinator,
    Testimonial, Package, Mix, Collection
)

def run():
    # ── 1. SITE CONFIG ────────────────────────────────────────────
    SiteConfig.objects.update_or_create(
        is_active=True,
        defaults={
            'brand_name': 'Mama Fresh',
            'brand_phone': '254792705921',
            'mission_statement': 'Village-sourced groceries, creating dignified livelihoods.',
        }
    )
    print("✓ SiteConfig")

    # ── 2. CATEGORIES ─────────────────────────────────────────────
    category_names = [
        "Vegetables", "Fruits", "Grains & Cereals",
        "Tubers & Roots", "Herbs & Spices", "Dairy & Eggs", "Legumes",
    ]
    categories = {}
    for name in category_names:
        cat, _ = Category.objects.get_or_create(name=name, defaults={'slug': slugify(name)})
        categories[name] = cat
    print(f"✓ {len(categories)} Categories")

    # ── 3. PRODUCTS ───────────────────────────────────────────────
    # (name, category, unit, price_kes, source_town, is_top_seller)
    products = [
        ("Tomatoes",            "Vegetables",      "kg",     80,  "Mwea, Kirinyaga",    False),
        ("Kale (Sukuma)",       "Vegetables",      "bunch",  20,  "Kiambu",             False),
        ("Cabbage",             "Vegetables",      "head",   60,  "Molo, Nakuru",       False),
        ("Carrots",             "Vegetables",      "kg",     70,  "Ol Kalou, Nyandarua",False),
        ("Spinach",             "Vegetables",      "bunch",  25,  "Kiambu",             False),
        ("Onions",              "Vegetables",      "kg",     90,  "Kajiado",            False),
        ("Green Peas",          "Vegetables",      "kg",    120,  "Ol Kalou, Nyandarua",False),
        ("Courgettes",          "Vegetables",      "kg",     80,  "Nyandarua",          False),
        ("Green Beans",         "Vegetables",      "kg",    100,  "Meru",               False),
        ("Garlic",              "Vegetables",      "kg",    400,  "Laikipia",           False),
        ("Bananas",             "Fruits",          "bunch",  80,  "Murang'a",           False),
        ("Mangoes",             "Fruits",          "kg",     60,  "Makueni",            False),
        ("Avocados",            "Fruits",          "kg",     80,  "Murang'a",           False),
        ("Passion Fruit",       "Fruits",          "kg",    150,  "Murang'a",           False),
        ("Pineapples",          "Fruits",          "piece",  80,  "Thika, Kiambu",      False),
        ("Oranges",             "Fruits",          "kg",     60,  "Meru",               False),
        ("Lemons",              "Fruits",          "kg",    100,  "Meru",               False),
        ("Watermelons",         "Fruits",          "piece", 200,  "Makueni",            False),
        ("Papaya",              "Fruits",          "piece", 100,  "Machakos",           False),
        ("Guava",               "Fruits",          "kg",     80,  "Murang'a",           False),
        ("Rice (Mwea Pishori)", "Grains & Cereals","kg",    180,  "Mwea, Kirinyaga",    True),
        ("Maize (Dried)",       "Grains & Cereals","kg",     60,  "Nakuru",             False),
        ("Potatoes",            "Tubers & Roots",  "kg",     70,  "Molo, Nakuru",       True),
        ("Sweet Potatoes",      "Tubers & Roots",  "kg",     60,  "Murang'a",           False),
        ("Arrowroots",          "Tubers & Roots",  "kg",     80,  "Murang'a",           False),
        ("Ginger",              "Herbs & Spices",  "kg",    200,  "Embu",               False),
        ("Coriander",           "Herbs & Spices",  "bunch",  20,  "Kiambu",             False),
        ("Spring Onions",       "Herbs & Spices",  "bunch",  20,  "Kiambu",             False),
        ("Eggs",                "Dairy & Eggs",    "tray",  350,  "Kiambu",             False),
        ("Fresh Milk",          "Dairy & Eggs",    "litre",  60,  "Nakuru",             False),
        ("Green Grams",         "Legumes",         "kg",    150,  "Makueni",            False),
        ("Kidney Beans",        "Legumes",         "kg",    180,  "Nakuru",             False),
    ]
    created_count = 0
    for name, cat_name, unit, price, town, top in products:
        _, created = Product.objects.get_or_create(
            name=name,
            defaults={
                'category': categories[cat_name],
                'unit': unit, 'price': price,
                'source_town': town, 'is_top_seller': top, 'is_available': True,
            }
        )
        if created:
            created_count += 1
    print(f"✓ {len(products)} Products ({created_count} new)")

    # ── 4. TOWN COORDINATORS ──────────────────────────────────────
    # (town, coordinator_name, delivery_fee_kes)
    towns = [
        ("Nairobi",             "Main Office",          200),
        ("Chuka",               "Chuka Hub",             50),
        ("Nyeri",               "Nyeri Coordinator",    150),
        ("Meru",                "Meru Coordinator",     150),
        ("Embu",                "Embu Coordinator",     150),
        ("Kiambu",              "Kiambu Coordinator",   100),
        ("Mwea, Kirinyaga",     "Mwea Coordinator",     120),
        ("Murang'a",            "Murang'a Coordinator", 130),
        ("Molo, Nakuru",        "Nakuru Coordinator",   200),
        ("Ol Kalou, Nyandarua", "Nyandarua Coordinator",180),
        ("Makueni",             "Makueni Coordinator",  200),
        ("Kajiado",             "Kajiado Coordinator",  150),
        ("Laikipia",            "Laikipia Coordinator", 200),
    ]
    for town, coord, fee in towns:
        TownCoordinator.objects.update_or_create(
            town=town,
            defaults={'coordinator_name': coord, 'delivery_fee': fee, 'pin': '1234', 'is_active': True}
        )
    print(f"✓ {len(towns)} Town Coordinators (default PIN: 1234 — change via /admin/coordinators)")

    # ── 5. TESTIMONIALS ───────────────────────────────────────────
    if not Testimonial.objects.exists():
        Testimonial.objects.bulk_create([
            Testimonial(name="Mercy, Chuka",     quote="Nyumbani made monthly shopping feel handled. I just place the order and the basics arrive sorted."),
            Testimonial(name="Wanjiku, Nairobi", quote="The custom basket flow is easy. I can quickly pick fruits, greens, and pantry items without back and forth."),
            Testimonial(name="Faith, Embu Road", quote="Sheree helped us prepare for a family event without overbuying. It saved both time and stress."),
        ])
        print("✓ 3 Testimonials")

    # ── 6. PACKAGES ───────────────────────────────────────────────
    if not Package.objects.exists():
        Package.objects.bulk_create([
            Package(
                name="Nyumbani", badge="Monthly groceries",
                description="Monthly home grocery shopping for individuals, couples, and small families.",
                speed="Best for routine family restocks",
                image_url="https://images.unsplash.com/photo-1768734831381-39336657aae9?q=80&w=1600",
                highlights=["Groceries & dry foods", "Cereals", "Fruits", "Greens & herbs"],
                contents=["Maize flour", "Rice", "Beans", "Cooking oil", "Fruits", "Greens", "Herbs"],
                use_cases=["Individuals", "Couples", "Small families"],
                pricing=[
                    {"label": "Nyumbani Lite",     "price": 3500, "summary": "Simple monthly basics for one person or a couple."},
                    {"label": "Nyumbani Standard", "price": 4500, "summary": "Balanced restock for a small household."},
                    {"label": "Nyumbani Plus",     "price": 6000, "summary": "Fuller monthly restock with more variety."},
                ]
            ),
            Package(
                name="Sheree", badge="Events package",
                description="Personalized grocery curation for events and occasions.",
                speed="Best for events and entertaining",
                image_url="https://images.unsplash.com/photo-1771659753573-e8498a262168?q=80&w=1600",
                highlights=["Weddings", "Introductions", "Family gatherings", "House warmings"],
                contents=["Tomatoes", "Onions", "Potatoes", "Fresh herbs", "Fruits", "Greens"],
                use_cases=["Ruracio and introductions", "Weddings", "Family gatherings"],
                pricing=[
                    {"label": "Small Gathering",  "price": 4500,  "summary": "For lighter event prep."},
                    {"label": "Family Function",  "price": 7500,  "summary": "For medium-size gatherings."},
                    {"label": "Large Occasion",   "price": 12000, "summary": "For bigger celebrations."},
                ]
            ),
            Package(
                name="Pamoja", badge="Group orders",
                description="Shared grocery shopping for small groups with lower costs.",
                speed="Best for shared or office orders",
                image_url="https://images.unsplash.com/photo-1759344114577-b6c32e4d68c8?q=80&w=1600",
                highlights=["3-4 people", "Smaller quantities", "Lower delivery costs"],
                contents=["Shared staples", "Mixed fruits", "Greens", "Vegetables"],
                use_cases=["Neighbours sharing groceries", "Small office orders"],
                pricing=[
                    {"label": "Two Households",         "price": 4000, "summary": "Shared basics with smaller split quantities."},
                    {"label": "Three Households",       "price": 6000, "summary": "A mixed basket suited to pooled shopping."},
                    {"label": "Office or Group Basket", "price": 8500, "summary": "A larger split-friendly order for a small team."},
                ]
            ),
        ])
        print("✓ 3 Packages")

    # ── 7. MIXES ──────────────────────────────────────────────────
    if not Mix.objects.exists():
        Mix.objects.bulk_create([
            Mix(title="Bright Start",    slug="bright-start",   description="Carrot, pineapple, ginger, and garlic",              items=["Carrots", "Pineapples", "Ginger", "Garlic"]),
            Mix(title="Green Refresh",   slug="green-refresh",  description="Kale, cucumber, ginger, and celery",                 items=["Kale (Sukuma)", "Courgettes", "Ginger", "Spring Onions"]),
            Mix(title="Citrus Balance",  slug="citrus-balance", description="Carrot, spinach, garlic, and lemon",                 items=["Carrots", "Spinach", "Garlic", "Lemons"]),
            Mix(title="Cooling Mix",     slug="cooling-mix",    description="Carrot, watermelon, cucumber, and coriander",        items=["Carrots", "Watermelons", "Courgettes", "Coriander"]),
        ])
        print("✓ 4 Mixes")

    # ── 8. COLLECTIONS ────────────────────────────────────────────
    if not Collection.objects.exists():
        Collection.objects.bulk_create([
            Collection(title="Weekly Essentials", description="Quick restock for everyday cooking.",
                       product_names=["Tomatoes", "Onions", "Potatoes", "Kale (Sukuma)", "Rice (Mwea Pishori)", "Fresh Milk"]),
            Collection(title="Juice Favourites",  description="Bright produce for blending and pressing.",
                       product_names=["Carrots", "Pineapples", "Ginger", "Lemons", "Passion Fruit"]),
            Collection(title="Family Restock",    description="Staples and fresh produce for a fuller household basket.",
                       product_names=["Rice (Mwea Pishori)", "Kidney Beans", "Potatoes", "Tomatoes", "Spinach", "Bananas"]),
        ])
        print("✓ 3 Collections")

    print("\nSeed complete. Remember to:")
    print("  • Update coordinator WhatsApp numbers via /admin/coordinators")
    print("  • Change coordinator PINs from the default 1234")
    print("  • Add product images via /admin/products")

if __name__ == "__main__":
    run()
