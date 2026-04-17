from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import (
    Order, Vendor, Category, Product, Package, Testimonial, Collection, Mix,
    TownCoordinator, OrderBatch, BatchVendorAssignment,
    ReferralCode, ReferralCredit, Courier, HarvestCalendar, Complaint, VendorPerformanceLog,
    SiteConfig, Subscription,
)
from .serializers import (
    OrderSerializer, VendorSerializer, CategorySerializer, ProductSerializer,
    PackageSerializer, TestimonialSerializer, CollectionSerializer, MixSerializer,
    TownCoordinatorSerializer, OrderBatchSerializer, BatchVendorAssignmentSerializer,
    CourierSerializer, HarvestCalendarSerializer, ComplaintSerializer,
    SiteConfigSerializer, SubscriptionSerializer,
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
        is_express = data.get('is_express', False)
        referral_code = data.get('referral_code', '').strip()
        
        # Calculate carbon saved
        carbon_saved = 4.2  # simple flat rate assumption for now
        
        base_price = sum(float(item['price']) * int(item['quantity']) for item in cart)
        total_price = base_price * 1.2 if is_express else base_price
        
        # Apply referral discount if possible
        discount_amount = 0
        from .models import ReferralCode, ReferralCredit
        
        # If user provided a referral code from someone else
        if referral_code:
            try:
                ref = ReferralCode.objects.get(code=referral_code)
                if ref.phone_number != customer_phone: # silent fail if same phone
                    # Create credit for the referrer
                    ReferralCredit.objects.create(referrer_phone=ref.phone_number, amount=50)
            except ReferralCode.DoesNotExist:
                pass
                
        # Check if this user has unused credits to apply to this order
        unused_credits = ReferralCredit.objects.filter(referrer_phone=customer_phone, is_used=False)
        if unused_credits.exists():
            credits_to_use = unused_credits[:1] # Just use one per order for now (KES 50)
            discount_amount = credits_to_use[0].amount
            credits_to_use[0].is_used = True
            credits_to_use[0].save()
            
        # Get delivery fee from TownCoordinator
        zone = data.get('zone', 'Nairobi')
        try:
            coord = TownCoordinator.objects.get(town__iexact=zone)
            delivery_fee = float(coord.delivery_fee)
        except TownCoordinator.DoesNotExist:
            delivery_fee = 200.0
            
        total_price = total_price + float(delivery_fee)
        total_price = max(0, total_price - float(discount_amount))
        
        # Generate their own referral code if they don't have one
        import random, string
        if customer_phone and customer_phone != 'N/A':
            if not ReferralCode.objects.filter(phone_number=customer_phone).exists():
                new_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
                ReferralCode.objects.create(phone_number=customer_phone, code=new_code)
                
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
            is_express=is_express,
            discount_amount=discount_amount,
            carbon_saved=carbon_saved,
            referral_code_used=referral_code if referral_code else None,
            vendor_assignments={
                "splits": assignments,
                "backups": backups,
                "manager_message": manager_message
            }
        )

        return Response({
            "order_id": order.order_id,
            "status": "SAVED",
            "message": "Order received and assigned to vendors.",
            "carbon_saved": carbon_saved,
            "discount_applied": discount_amount
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

        # Get SiteConfig for overrides
        config = SiteConfig.objects.filter(is_active=True).first()
        display_farmers = config.impact_farmers_override if config and config.impact_farmers_override else vendors.count()
        display_families = config.impact_families_override if config and config.impact_families_override else total_orders

        # OPTIMIZED: Fetch all confirmed orders once to count vendor assignments
        confirmed_orders = Order.objects.filter(status='CONFIRMED')
        vendor_order_counts = {}
        for order in confirmed_orders:
            # Assuming assignments are stored in JSON as: { "splits": [ { "vendor": { "id": 1 }, ... }, ... ] }
            splits = (order.vendor_assignments or {}).get('splits', [])
            for split in splits:
                v_id = split.get('vendor', {}).get('id')
                if v_id:
                    vendor_order_counts[v_id] = vendor_order_counts.get(v_id, 0) + 1

        # Per-farmer breakdown for the Impact page
        farmer_breakdown = []
        for v in vendors:
            v_orders = vendor_order_counts.get(v.id, 0)
            farmer_breakdown.append({
                "name": v.full_name,
                "stall": v.stall_number,
                "income": float(v_orders * 500), 
                "orders": v_orders
            })
        
        # Sort by income desc
        farmer_breakdown.sort(key=lambda x: x['income'], reverse=True)

        return Response({
            "totalRuralIncome": total_income,
            "totalOrders": total_orders,
            "foodMilesSaved": food_miles_saved,
            "vendorsSupported": display_farmers,
            "familiesServed": display_families,
            "farmerEarnings": farmer_breakdown[:10],
            "vendorList": equity
        })

class SiteConfigView(APIView):
    def get(self, request):
        config = SiteConfig.objects.filter(is_active=True).first()
        if not config:
            return Response({"error": "No active config"}, status=404)
        return Response(SiteConfigSerializer(config).data)


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

class TownCoordinatorListView(generics.ListCreateAPIView):
    queryset = TownCoordinator.objects.all()
    serializer_class = TownCoordinatorSerializer

class TownCoordinatorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TownCoordinator.objects.all()
    serializer_class = TownCoordinatorSerializer

class CoordinatorLoginView(APIView):
    """PIN-based login — returns coordinator data if PIN matches town"""
    def post(self, request):
        town = request.data.get('town')
        pin = request.data.get('pin')
        try:
            coordinator = TownCoordinator.objects.get(town__iexact=town, pin=pin, is_active=True)
            serializer = TownCoordinatorSerializer(coordinator)
            return Response({'success': True, 'coordinator': serializer.data})
        except TownCoordinator.DoesNotExist:
            return Response({'success': False, 'error': 'Invalid town or PIN'}, status=status.HTTP_401_UNAUTHORIZED)

class BatchCreateView(APIView):
    """
    Creates a new OPEN batch from all PENDING unbatched orders.
    Aggregates items by source_town + product_name.
    For each town, fetches active vendors and splits quantity equally.
    """
    def post(self, request):
        from collections import defaultdict
        from decimal import Decimal

        is_express = request.data.get('is_express', False)

        # Get all unbatched pending orders
        orders = Order.objects.filter(status='PENDING', batch__isnull=True)
        if is_express:
            orders = orders.filter(is_express=True)

        if not orders.exists():
            return Response({'error': 'No pending unbatched orders found'}, status=status.HTTP_400_BAD_REQUEST)

        # Create batch
        batch = OrderBatch.objects.create(is_express=is_express)

        # Link orders to batch
        orders.update(batch=batch)

        # Aggregate: {source_town: {product_name: {unit, total_qty}}}
        town_products = defaultdict(lambda: defaultdict(lambda: {'unit': '', 'total_qty': Decimal('0')}))

        for order in orders:
            for item in (order.items or []):
                name = item.get('name', '')
                qty = Decimal(str(item.get('quantity', 1)))
                unit = item.get('unit', 'kg')

                # Find product to get source_town
                product = Product.objects.filter(name__iexact=name).first()
                town = (product.source_town.strip() if product and product.source_town else 'Unassigned')

                town_products[town][name]['unit'] = unit
                town_products[town][name]['total_qty'] += qty

        # For each town+product, split among active vendors
        for town, products in town_products.items():
            # Get active & verified vendors for this town (Rotation logic helper could be here, but we use equal split for batching)
            # Find vendors associated with the categories of the products in this town
            vendor_list = list(Vendor.objects.filter(is_active=True, is_verified=True)) # Simpler filter for now as requested
            
            for product_name, info in products.items():
                total_qty = info['total_qty']
                unit = info['unit']

                if not vendor_list:
                    # No vendors — assign to coordinator
                    BatchVendorAssignment.objects.create(
                        batch=batch, town=town,
                        vendor_name='Coordinator',
                        vendor_whatsapp='',
                        product_name=product_name,
                        unit=unit,
                        quantity=total_qty,
                        source_town=town
                    )
                    continue

                # Equal split
                per_vendor = (total_qty / Decimal(str(len(vendor_list)))).quantize(Decimal('0.1'))
                remainder = total_qty - (per_vendor * len(vendor_list))

                for i, vendor in enumerate(vendor_list):
                    qty = per_vendor + (remainder if i == 0 else Decimal('0'))
                    BatchVendorAssignment.objects.create(
                        batch=batch,
                        town=town,
                        vendor_name=vendor.full_name,
                        vendor_whatsapp=vendor.whatsapp_number,
                        product_name=product_name,
                        unit=unit,
                        quantity=qty,
                        source_town=town
                    )

        serializer = OrderBatchSerializer(batch)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class BatchListView(generics.ListAPIView):
    queryset = OrderBatch.objects.all().order_by('-created_at')
    serializer_class = OrderBatchSerializer

class BatchDetailView(generics.RetrieveUpdateAPIView):
    queryset = OrderBatch.objects.all()
    serializer_class = OrderBatchSerializer

class BatchAssignmentsView(APIView):
    """Returns all assignments for a batch, grouped by town"""
    def get(self, request, pk):
        try:
            batch = OrderBatch.objects.get(pk=pk)
        except OrderBatch.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        assignments = BatchVendorAssignment.objects.filter(batch=batch)
        towns = {}
        for a in assignments:
            if a.town not in towns:
                coordinator = TownCoordinator.objects.filter(town__iexact=a.town).first()
                towns[a.town] = {
                    'town': a.town,
                    'coordinator': {
                        'name': coordinator.coordinator_name if coordinator else '',
                        'whatsapp': coordinator.whatsapp_number if coordinator else '',
                    } if coordinator else None,
                    'assignments': []
                }
            towns[a.town]['assignments'].append(BatchVendorAssignmentSerializer(a).data)

        return Response({
            'batch': OrderBatchSerializer(batch).data,
            'towns': list(towns.values())
        })

class AssignmentUpdateView(generics.RetrieveUpdateAPIView):
    queryset = BatchVendorAssignment.objects.all()
    serializer_class = BatchVendorAssignmentSerializer

class RebalanceView(APIView):
    """Redistributes quantity after marking a vendor absent"""
    def post(self, request, pk):
        from decimal import Decimal
        try:
            batch = OrderBatch.objects.get(pk=pk)
        except OrderBatch.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        town = request.data.get('town')
        product_name = request.data.get('product_name')

        assignments = BatchVendorAssignment.objects.filter(batch=batch, town=town, product_name=product_name)
        active = list(assignments.filter(is_absent=False))
        total = sum(a.quantity for a in assignments)

        if not active:
            return Response({'error': 'No active vendors left'})

        per_vendor = (Decimal(str(total)) / Decimal(str(len(active)))).quantize(Decimal('0.1'))
        remainder = Decimal(str(total)) - (per_vendor * len(active))

        for i, a in enumerate(active):
            a.quantity = per_vendor + (remainder if i == 0 else Decimal('0'))
            a.save()

        return Response({'rebalanced': True, 'assignments': BatchVendorAssignmentSerializer(assignments, many=True).data})

class CoordinatorDashboardView(APIView):
    def get(self, request):
        town = request.query_params.get('town')
        pin = request.query_params.get('pin')
        try:
            coordinator = TownCoordinator.objects.get(town__iexact=town, pin=pin, is_active=True)
        except TownCoordinator.DoesNotExist:
            return Response({'error': 'Unauthorized'}, status=401)

        open_batches = OrderBatch.objects.filter(status='OPEN').order_by('-created_at')
        result = []
        for batch in open_batches:
            assignments = BatchVendorAssignment.objects.filter(batch=batch, town__iexact=town)
            if assignments.exists():
                result.append({
                    'batch': OrderBatchSerializer(batch).data,
                    'assignments': BatchVendorAssignmentSerializer(assignments, many=True).data
                })

        return Response({
            'coordinator': TownCoordinatorSerializer(coordinator).data,
            'batches': result
        })

class DispatchBatchView(APIView):
    def post(self, request, pk):
        from django.utils import timezone
        try:
            batch = OrderBatch.objects.get(pk=pk)
            batch.status = 'DISPATCHED'
            batch.dispatched_at = timezone.now()
            batch.save()
            return Response(OrderBatchSerializer(batch).data)
        except OrderBatch.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

class CourierListView(generics.ListCreateAPIView):
    queryset = Courier.objects.all()
    serializer_class = CourierSerializer

class CourierDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Courier.objects.all()
    serializer_class = CourierSerializer

class HarvestCalendarView(APIView):
    def get(self, request):
        vendor_id = request.query_params.get('vendor_id')
        if vendor_id:
            harvests = HarvestCalendar.objects.filter(vendor_id=vendor_id)
        else:
            harvests = HarvestCalendar.objects.all()
        return Response(HarvestCalendarSerializer(harvests, many=True).data)

    def post(self, request):
        serializer = HarvestCalendarSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ComplaintCreateView(generics.ListCreateAPIView):
    queryset = Complaint.objects.all().order_by('-created_at')
    serializer_class = ComplaintSerializer

    def perform_create(self, serializer):
        complaint = serializer.save()
        vendor = complaint.vendor
        VendorPerformanceLog.objects.create(
            vendor=vendor, log_type='STRIKE',
            note=f"Complaint on order {complaint.order.order_id}: {complaint.reason}"
        )
        complaints_count = Complaint.objects.filter(vendor=vendor).count()
        vendor.reliability_score = max(0, 100 - (complaints_count * 10))
        vendor.save()

class ComplaintDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer

class ReferralCodeDetailView(APIView):
    def get(self, request):
        phone = request.query_params.get('phone')
        if not phone:
            return Response({"error": "Phone required"}, status=400)
        try:
            ref = ReferralCode.objects.get(phone_number=phone)
            return Response({"code": ref.code})
        except ReferralCode.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

class BatchTrackingUpdateView(APIView):
    def patch(self, request, pk):
        try:
            batch = OrderBatch.objects.get(pk=pk)
            field = request.data.get('field')
            if field in ['pickup_confirmed_at', 'arrived_nairobi_at', 'dispatched_to_customers_at']:
                from django.utils import timezone
                setattr(batch, field, timezone.now())
                if field == 'arrived_nairobi_at':
                    batch.notes += f"\nArrived in Nairobi at {timezone.now()}"
                batch.save()
                return Response(OrderBatchSerializer(batch).data)
            return Response({"error": "Invalid field"}, status=400)
        except OrderBatch.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

class SubscriptionListCreateView(generics.ListCreateAPIView):
    queryset = Subscription.objects.all().order_by('-created_at')
    serializer_class = SubscriptionSerializer

class SubscriptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer

class OrderTransparencyView(generics.RetrieveAPIView):
    """Public endpoint — anyone with the order_id can verify their order."""
    lookup_field = 'order_id'
    queryset = Order.objects.select_related('batch').prefetch_related('batch__orders', 'batch__assignments')

    def retrieve(self, request, *args, **kwargs):
        order = self.get_object()
        
        # Build per-item breakdown
        items_detail = []
        for item in (order.items or []):
            # Find matching vendor assignment
            vendor = None
            verification_data = None
            
            if order.batch:
                assignment = order.batch.assignments.filter(
                    product_name__icontains=item['name']
                ).first()
                if assignment:
                    verification_data = {
                        'status': assignment.verification_status,
                        'qty': assignment.verified_quantity
                    }
                    vendor = {
                        'name': assignment.vendor_name,
                        'source_town': assignment.source_town,
                        'quantity_supplied': str(assignment.quantity),
                        'unit': assignment.unit,
                    }

            try:
                # Prioritize verified quantity if hub has inspected it
                if verification_data and verification_data['status'] != 'PENDING' and verification_data['qty']:
                     weight_kg = float(verification_data['qty'])
                else:
                     weight_kg = float(item.get('qty') or 1)
            except (ValueError, TypeError):
                weight_kg = 1.0
                
            co2 = round(weight_kg * 0.42, 2)  # 0.42 kg CO2 per kg avoided
            
            items_detail.append({
                'product': item['name'],
                'qty': item.get('qty'),
                'unit': item.get('unit'),
                'price_paid': item.get('price'),
                'co2_saved_kg': co2,
                'vendor': vendor,
                'hub_verified': verification_data['status'] if verification_data else 'PENDING'
            })

        return Response({
            'order_id': str(order.order_id),
            'customer_name': order.customer_name,
            'order_date': order.created_at.date().isoformat(),
            'total_price': str(order.total_price),
            'discount_applied': str(order.discount_amount),
            'total_co2_saved_kg': str(order.carbon_saved),
            'items': items_detail,
            'verification_note': (
                'CO2 savings calculated vs. equivalent supermarket supply chain '
                '(0.42 kg CO2 per kg of produce, based on Trucost farm-to-retail benchmarks).'
            ),
        })

class CourierBatchListView(generics.ListAPIView):
    """Public (no-auth) batch lookup by courier phone."""
    serializer_class = OrderBatchSerializer
    
    def get_queryset(self):
        phone = self.request.query_params.get('phone')
        if not phone:
            return OrderBatch.objects.none()
        return OrderBatch.objects.filter(
            courier__phone_number=phone,
            status__in=['OPEN', 'DISPATCHED']
        ).prefetch_related('orders', 'assignments').order_by('-created_at')

class BatchAssignmentVerifyView(generics.UpdateAPIView):
    """Update verification status for a single assignment (Hub Inspection)."""
    queryset = BatchVendorAssignment.objects.all()
    serializer_class = BatchVendorAssignmentSerializer

class BatchSealView(APIView):
    """Finalize hub inspection for a batch."""
    def post(self, request, pk):
        from django.utils import timezone
        batch = get_object_or_404(OrderBatch, pk=pk)
        
        # Mark all pending items as OK if they weren't manually edited
        batch.assignments.filter(verification_status='PENDING').update(
            verification_status='OK',
            verified_quantity=F('quantity')
        )
        
        batch.hub_verified_at = timezone.now()
        batch.save()
        
        return Response({
            'status': 'sealed',
            'hub_verified_at': batch.hub_verified_at
        })

