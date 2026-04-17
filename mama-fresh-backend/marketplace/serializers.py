from rest_framework import serializers
from .models import (
    Category, Vendor, Product, Order, Package, Testimonial, 
    Collection, Mix, TownCoordinator, OrderBatch, 
    BatchVendorAssignment, Courier, Complaint, 
    HarvestCalendar, VendorPerformanceLog, SiteConfig,
    ReferralCode, ReferralCredit, Subscription
)

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug')

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = (
            'id', 'full_name', 'stall_number', 'whatsapp_number', 
            'bio', 'profile_image', 'joined_date', 'reliability_score', 
            'is_active', 'is_verified'
        )
        read_only_fields = ('reliability_score', 'joined_date')

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    class Meta:
        model = Product
        fields = (
            'id', 'name', 'category', 'category_name', 'unit', 
            'price', 'sale_price', 'image_url', 'is_top_seller', 
            'is_available', 'source_town', 'stock_quantity'
        )

class CourierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Courier
        fields = ('id', 'name', 'phone_number', 'is_active')

class OrderBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderBatch
        fields = (
            'id', 'batch_date', 'status', 'is_express', 'created_at', 
            'dispatched_at', 'notes', 'courier', 'pickup_confirmed_at', 
            'arrived_nairobi_at', 'dispatched_to_customers_at', 'hub_verified_at'
        )

class OrderSerializer(serializers.ModelSerializer):
    batch_detail = OrderBatchSerializer(source='batch', read_only=True)
    class Meta:
        model = Order
        fields = (
            'id', 'order_id', 'customer_name', 'customer_phone', 
            'location', 'total_price', 'status', 'payment_status', 
            'mpesa_code', 'items', 'vendor_assignments', 'customer_ip', 
            'created_at', 'batch', 'batch_detail', 'is_express', 
            'referral_code_used', 'discount_amount', 'carbon_saved'
        )
        read_only_fields = (
            'order_id', 'total_price', 'payment_status', 'mpesa_code', 
            'vendor_assignments', 'customer_ip', 'created_at', 'batch', 
            'carbon_saved'
        )

class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = (
            'id', 'name', 'badge', 'description', 'speed', 
            'image_url', 'highlights', 'contents', 'use_cases', 
            'pricing', 'is_active'
        )

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ('id', 'name', 'quote', 'is_active', 'created_at')

class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = ('id', 'title', 'description', 'product_names', 'is_active', 'order')

class MixSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mix
        fields = ('id', 'title', 'slug', 'description', 'items', 'image_url', 'order')

class TownCoordinatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = TownCoordinator
        fields = ('id', 'town', 'coordinator_name', 'whatsapp_number', 'delivery_fee', 'is_active')

class BatchVendorAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BatchVendorAssignment
        fields = (
            'id', 'batch', 'town', 'vendor_name', 'vendor_whatsapp', 
            'product_name', 'unit', 'quantity', 'source_town', 
            'is_absent', 'reassigned_product', 'whatsapp_sent',
            'verified_quantity', 'verification_status', 'verification_notes'
        )

class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = (
            'id', 'order', 'vendor', 'product_name', 'reason', 
            'status', 'strike_issued', 'created_at'
        )

class HarvestCalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = HarvestCalendar
        fields = ('id', 'vendor', 'product_name', 'date_available', 'expected_qty')

class VendorPerformanceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorPerformanceLog
        fields = ('id', 'vendor', 'log_type', 'note', 'created_at')

class SiteConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteConfig
        fields = (
            'id', 'brand_name', 'brand_phone', 'mission_statement', 
            'impact_farmers_override', 'impact_families_override'
        )

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'
