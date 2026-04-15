from django.contrib import admin
from .models import Category, Vendor, Order

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'stall_number', 'whatsapp_number', 'last_assigned_at')
    filter_horizontal = ('categories',)
    search_fields = ('full_name', 'stall_number')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'customer_name', 'total_price', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order_id', 'customer_name', 'customer_phone')
    readonly_fields = ('order_id', 'created_at', 'items', 'vendor_assignments')
