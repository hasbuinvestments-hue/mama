from django.utils import timezone
from .models import Category, Vendor, Order

def assign_vendors_to_order(cart_items):
    """
    Groups cart items by assigned vendor using Round Robin logic.
    cart_items: list of dicts { id, name, category, price, quantity, unit }
    """
    assignments = {} # { vendor_id: { vendor_info, items: [] } }
    backup_vendors = {} # { category_name: backup_vendor_info }

    # Group items by category first to ensure "Rotation per category per order"
    items_by_category = {}
    for item in cart_items:
        cat_name = item.get('category', 'Other')
        if cat_name not in items_by_category:
            items_by_category[cat_name] = []
        items_by_category[cat_name].append(item)

    # For each category, pick a primary and secondary vendor
    for cat_name, items in items_by_category.items():
        # Find vendors that sell this category, ordered by last_assigned_at (Round Robin)
        eligible_vendors = Vendor.objects.filter(
            categories__name=cat_name, 
            is_active=True
        ).order_by('last_assigned_at')

        if not eligible_vendors.exists():
            # Fallback for no vendor found
            vendor_id = "placeholder"
            v_info = {"name": "MAMA FRESH (PENDING)", "stall": "N/A", "phone": "N/A"}
        else:
            primary_v = eligible_vendors[0]
            vendor_id = str(primary_v.id)
            v_info = {
                "id": primary_v.id,
                "name": primary_v.full_name,
                "stall": primary_v.stall_number,
                "phone": primary_v.whatsapp_number,
                "category": cat_name
            }
            
            # Identify backup (next in rotation)
            if eligible_vendors.count() > 1:
                backup_v = eligible_vendors[1]
                backup_vendors[cat_name] = {
                    "name": backup_v.full_name,
                    "stall": backup_v.stall_number
                }

            # Update the rotation timestamp for the primary vendor
            primary_v.last_assigned_at = timezone.now()
            primary_v.save()

        if vendor_id not in assignments:
            assignments[vendor_id] = {
                "vendor": v_info,
                "items": []
            }
        assignments[vendor_id]["items"].extend(items)

    return list(assignments.values()), backup_vendors

def format_manager_message(order_id, customer_name, phone, location, delivery_type, assignments, backups):
    """
    Generates the beautiful WhatsApp string for the coordinator view.
    """
    msg = [
        f"🛒 ORDER #{order_id}",
        "━━━━━━━━━━━━━━━━━━━━━━━",
        f"{customer_name} | {phone}",
        f"{location} | {delivery_type}",
        "━━━━━━━━━━━━━━━━━━━━━━━",
        ""
    ]

    grand_total = 0
    for block in assignments:
        v = block["vendor"]
        msg.append(f"📦 {v['name'].upper()} — {v['stall']} ({v.get('category', '')})")
        subtotal = 0
        for item in block["items"]:
            cost = float(item['price']) * int(item['quantity'])
            subtotal += cost
            msg.append(f"• {item['name']} × {item['quantity']} {item['unit']} — KES {int(cost)}")
        
        msg.append(f"Subtotal: KES {int(subtotal)}")
        msg.append("")
        grand_total += subtotal

    msg.append("━━━━━━━━━━━━━━━━━━━━━━━")
    msg.append(f"TOTAL: KES {int(grand_total)}")
    msg.append("━━━━━━━━━━━━━━━━━━━━━━━")
    
    if backups:
        msg.append("")
        msg.append("⚠️ Backup vendors:")
        for cat, bv in backups.items():
            msg.append(f"{cat} → {bv['name']} ({bv['stall']})")
    
    return "\n".join(msg)
