from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order, Vendor, Category, Product, Package, Testimonial, Collection, Mix
from .serializers import (
    OrderSerializer, VendorSerializer, CategorySerializer, ProductSerializer,
    PackageSerializer, TestimonialSerializer, CollectionSerializer, MixSerializer,
)
from .logic import assign_vendors_to_order, format_manager_message
import uuid

class OrderCreateView(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        cart = data.get('cart', [])
        
        if not cart:
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Logic: Split order by vendor using the rotation system
        assignments, backups = assign_vendors_to_order(cart)

        # 2. Create the order in DB
        customer_name = data.get('customerName', 'Anonymous')
        customer_phone = data.get('phone', 'N/A')
        location = data.get('location', 'N/A')
        total_price = sum(float(item['price']) * int(item['quantity']) for item in cart)
        
        # Unique Order ID using date-style prefix or counter
        order_num = str(uuid.uuid4())[:8].upper()
        order_id = f"CUS-{order_num}"

        # 3. Generate the formatted message for the manager to see in the dashboard
        manager_message = format_manager_message(
            order_id, customer_name, customer_phone, location, 
            data.get('deliveryType', 'Parcel'), assignments, backups
        )

        # Capture customer IP (works behind proxies too)
        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        customer_ip = x_forwarded.split(',')[0].strip() if x_forwarded else request.META.get('REMOTE_ADDR')

        order = Order.objects.create(
            order_id=order_id,
            customer_name=customer_name,
            customer_phone=customer_phone,
            location=location,
            total_price=total_price,
            items=cart,
            customer_ip=customer_ip,
            vendor_assignments={
                "splits": assignments,
                "backups": backups,
                "manager_message": manager_message
            }
        )

        return Response({
            "order_id": order.order_id,
            "status": "SAVED",
            "message": "Order received and assigned to vendors."
        }, status=status.HTTP_201_CREATED)

class AdminOrderListView(generics.ListAPIView):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.all().order_by('-created_at')

class OrderDetailView(generics.RetrieveUpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    lookup_field = 'order_id'

class VendorListView(generics.ListCreateAPIView):
    queryset = Vendor.objects.all().order_by('full_name')
    serializer_class = VendorSerializer

class VendorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

from django.db.models import Sum

class ProductListView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class PackageListCreateView(generics.ListCreateAPIView):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer

class PackageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer

class CustomerOrderHistoryView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
            ip = x_forwarded.split(',')[0].strip() if x_forwarded else request.META.get('REMOTE_ADDR')

            orders = Order.objects.filter(customer_ip=ip).order_by('-created_at')
            serializer = OrderSerializer(orders, many=True)
        except Exception:
            return Response({"orders": [], "frequent_items": [], "error": "Run migrations: python manage.py migrate"})

        # Compute frequently ordered items across all orders for this IP
        from collections import Counter
        item_counts = Counter()
        for order in orders:
            for item in (order.items or []):
                name = item.get('name', '')
                if name:
                    item_counts[name] += item.get('quantity', 1)

        frequent = [
            {"name": name, "count": count}
            for name, count in item_counts.most_common(5)
        ]

        return Response({
            "orders": serializer.data,
            "frequent_items": frequent,
        })

class AnalyticsView(APIView):
    def get(self, request, *args, **kwargs):
        income_agg = Order.objects.filter(status='CONFIRMED').aggregate(total=Sum('total_price'))
        total_income = float(income_agg['total'] or 0)
        
        total_orders = Order.objects.count()
        food_miles_saved = total_orders * 25  # Estimated 25 miles saved per direct order

        vendors = Vendor.objects.filter(is_active=True)
        equity = []
        for v in vendors:
            # A simple estimation based on last assigned, but for MVP we just list they are supported
            equity.append({
                "name": v.full_name,
                "stall": v.stall_number,
                "joined": str(v.joined_date)
            })

        return Response({
            "totalRuralIncome": total_income,
            "totalOrders": total_orders,
            "foodMilesSaved": food_miles_saved,
            "vendorsSupported": vendors.count(),
            "vendorList": equity
        })


class TestimonialListView(generics.ListAPIView):
    queryset = Testimonial.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = TestimonialSerializer

class AdminTestimonialListView(generics.ListCreateAPIView):
    queryset = Testimonial.objects.all().order_by('-created_at')
    serializer_class = TestimonialSerializer

class TestimonialDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer


class CollectionListView(generics.ListAPIView):
    queryset = Collection.objects.filter(is_active=True).order_by('order')
    serializer_class = CollectionSerializer

class AdminCollectionListView(generics.ListCreateAPIView):
    queryset = Collection.objects.all().order_by('order')
    serializer_class = CollectionSerializer

class CollectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Collection.objects.all()
    serializer_class = CollectionSerializer


class MixListView(generics.ListCreateAPIView):
    queryset = Mix.objects.all().order_by('order')
    serializer_class = MixSerializer

class MixDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Mix.objects.all()
    serializer_class = MixSerializer

