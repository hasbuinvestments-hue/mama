import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from marketplace.models import Category, Vendor, Product

def seed():
    print("Seeding database...")
    
    # 1. Categories
    categories = [
        "Fruits", "Vegetables", "Greens", "Herbs", "Staples", "Pantry"
    ]
    cat_objs = {}
    for name in categories:
        obj, created = Category.objects.get_or_create(
            name=name, 
            slug=name.lower().replace(" ", "-")
        )
        cat_objs[name] = obj
        if created: print(f"Created category: {name}")

    # 2. Vendors
    vendors = [
        {
            "name": "Mama Njeri",
            "stall": "Stall 3",
            "phone": "254700000001",
            "cats": ["Fruits", "Greens"],
            "bio": "Growing sukuma wiki for 15 years. Uses traditional organic methods.",
            "profile_image": "https://images.unsplash.com/photo-1531123414708-f473625e1fc4?auto=format&fit=crop&q=80&w=400",
            "joined_date": "2023-01-15"
        },
        {
            "name": "Mama Wambui",
            "stall": "Stall 6",
            "phone": "254700000002",
            "cats": ["Fruits"],
            "bio": "Specializes in mangoes and citrus. Leads the local farmer's cooperative in Chuka.",
            "profile_image": "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?auto=format&fit=crop&q=80&w=400",
            "joined_date": "2023-03-20"
        },
        {
            "name": "Baba Kamau",
            "stall": "Stall 7",
            "phone": "254700000003",
            "cats": ["Vegetables"],
            "bio": "Passionate about root vegetables and soil health. His carrots are legendary.",
            "profile_image": "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&q=80&w=400",
            "joined_date": "2024-06-10"
        },
        {
            "name": "Mama Nyambura",
            "stall": "Stall 9",
            "phone": "254700000004",
            "cats": ["Vegetables", "Herbs"],
            "bio": "Grows rare indigenous herbs and staple veggies with zero chemical pesticides.",
            "profile_image": "https://images.unsplash.com/photo-1596489370845-a757ccb7c4cf?auto=format&fit=crop&q=80&w=400",
            "joined_date": "2023-11-05"
        },
        {
            "name": "Mama Akinyi",
            "stall": "Stall 12",
            "phone": "254700000005",
            "cats": ["Staples", "Pantry"],
            "bio": "Expert in dry grains, rice, and pantry staples sourced from honest village mills.",
            "profile_image": "https://images.unsplash.com/photo-1531384370597-859faa9ce73c?auto=format&fit=crop&q=80&w=400",
            "joined_date": "2025-01-08"
        }
    ]

    for v in vendors:
        obj, created = Vendor.objects.get_or_create(
            full_name=v["name"],
            stall_number=v["stall"],
            defaults={
                "whatsapp_number": v["phone"],
                "bio": v.get("bio"),
                "profile_image": v.get("profile_image"),
                "joined_date": v.get("joined_date", "2023-01-01")
            }
        )
        for cat_name in v["cats"]:
            obj.categories.add(cat_objs[cat_name])
        if created: print(f"Created vendor: {v['name']}")

    print("Seeding complete!")

if __name__ == "__main__":
    seed()
