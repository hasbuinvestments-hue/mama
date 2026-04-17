from django.db import models
import uuid

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"

from django.utils import timezone

class Vendor(models.Model):
    full_name = models.CharField(max_length=200)
    stall_number = models.CharField(max_length=50)
    whatsapp_number = models.CharField(max_length=20)
    bio = models.TextField(null=True, blank=True)
    profile_image = models.CharField(max_length=500, null=True, blank=True)
    joined_date = models.DateField(default=timezone.now)
    categories = models.ManyToManyField(Category, related_name='vendors')
    last_assigned_at = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=True)
    misses_count = models.PositiveIntegerField(default=0)
    reliability_score = models.PositiveIntegerField(default=100) # 0-100 scale

    def __str__(self):
        return f"{self.full_name} ({self.stall_number})"

    class Meta:
        ordering = ['last_assigned_at']

class Product(models.Model):
    name = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    unit = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    image_url = models.CharField(max_length=500, null=True, blank=True)
    is_top_seller = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    source_town = models.CharField(max_length=100, blank=True, default='')
    stock_quantity = models.IntegerField(default=100)

    def __str__(self):
        return self.name

class Order(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('UNPAID', 'Unpaid'),
        ('PAID', 'Paid'),
    ]

    order_id = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    customer_name = models.CharField(max_length=200)
    from django.core.validators import RegexValidator
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")
    customer_phone = models.CharField(validators=[phone_regex], max_length=20)
    location = models.TextField()
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='UNPAID')
    mpesa_code = models.CharField(max_length=20, null=True, blank=True)
    items = models.JSONField()
    vendor_assignments = models.JSONField(null=True, blank=True)
    customer_ip = models.GenericIPAddressField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    batch = models.ForeignKey('OrderBatch', null=True, blank=True, on_delete=models.SET_NULL, related_name='orders', db_index=True)
    is_express = models.BooleanField(default=False)
    referral_code_used = models.CharField(max_length=50, null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    carbon_saved = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"Order {self.order_id} - {self.customer_name}"

class Package(models.Model):
    name = models.CharField(max_length=200)
    badge = models.CharField(max_length=100)
    description = models.TextField()
    speed = models.CharField(max_length=200, blank=True)
    image_url = models.CharField(max_length=500, blank=True)
    highlights = models.JSONField(default=list)
    contents = models.JSONField(default=list)
    use_cases = models.JSONField(default=list)
    pricing = models.JSONField(default=list)  # [{label, price, summary, items}]
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Testimonial(models.Model):
    name = models.CharField(max_length=200)
    quote = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name}: {self.quote[:50]}"

class Collection(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    product_names = models.JSONField(default=list)  # list of product name strings
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

class Mix(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.CharField(max_length=500)
    items = models.JSONField(default=list)  # list of product name strings
    image_url = models.CharField(max_length=500, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name_plural = 'Mixes'

    def __str__(self):
        return self.title

class TownCoordinator(models.Model):
    town = models.CharField(max_length=100, unique=True)
    coordinator_name = models.CharField(max_length=200)
    whatsapp_number = models.CharField(max_length=20)
    pin = models.CharField(max_length=6, default='0000')
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=200)
    is_active = models.BooleanField(default=True)
    def __str__(self): return f"{self.town} (KES {self.delivery_fee})"

class OrderBatch(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('DISPATCHED', 'Dispatched'),
        ('DELIVERED', 'Delivered'),
    ]
    batch_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    is_express = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    dispatched_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    # Logistics tracking
    courier = models.ForeignKey('Courier', on_delete=models.SET_NULL, null=True, blank=True)
    pickup_confirmed_at = models.DateTimeField(null=True, blank=True)
    arrived_nairobi_at = models.DateTimeField(null=True, blank=True)
    dispatched_to_customers_at = models.DateTimeField(null=True, blank=True)
    hub_verified_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Batch {self.batch_date} ({self.status})"

class BatchVendorAssignment(models.Model):
    batch = models.ForeignKey(OrderBatch, on_delete=models.CASCADE, related_name='assignments')
    town = models.CharField(max_length=100)
    vendor_name = models.CharField(max_length=200)
    vendor_whatsapp = models.CharField(max_length=20)
    product_name = models.CharField(max_length=200)
    unit = models.CharField(max_length=50)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    source_town = models.CharField(max_length=100, blank=True)
    is_absent = models.BooleanField(default=False)
    reassigned_product = models.CharField(max_length=200, blank=True)
    whatsapp_sent = models.BooleanField(default=False)
    
    # Hub Verification
    verified_quantity = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    verification_status = models.CharField(
        max_length=20, 
        choices=[
            ('PENDING', 'Pending'),
            ('OK', 'OK'),
            ('AMENDED', 'Amended'),
            ('SHORT', 'Shortage')
        ],
        default='PENDING'
    )
    verification_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

class ReferralCode(models.Model):
    phone_number = models.CharField(max_length=20, unique=True)
    code = models.CharField(max_length=20, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return f"{self.phone_number} -> {self.code}"

class ReferralCredit(models.Model):
    referrer_phone = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=50)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class Courier(models.Model):
    name = models.CharField(max_length=200)
    phone_number = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)
    def __str__(self): return self.name

class HarvestCalendar(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='harvests')
    product_name = models.CharField(max_length=200)
    date_available = models.DateField()
    expected_qty = models.DecimalField(max_digits=10, decimal_places=2)
    def __str__(self): return f"{self.vendor} - {self.product_name}"

class Complaint(models.Model):
    STATUS_CHOICES = [('PENDING', 'Pending'), ('RESOLVED', 'Resolved')]
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='complaints')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
    product_name = models.CharField(max_length=200)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    strike_issued = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class VendorPerformanceLog(models.Model):
    TYPE_CHOICES = [('ABSENT', 'Absent'), ('MISS', 'Miss'), ('STRIKE', 'Strike')]
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='performance_logs')
    log_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class SiteConfig(models.Model):
    brand_name = models.CharField(max_length=100, default='Mama Fresh')
    brand_phone = models.CharField(max_length=20, default='254792705921')
    mission_statement = models.TextField(blank=True)
    impact_farmers_override = models.IntegerField(null=True, blank=True)
    impact_families_override = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self): return self.brand_name

class Subscription(models.Model):
    FREQUENCY_CHOICES = [('WEEKLY', 'Weekly'), ('MONTHLY', 'Monthly')]
    STATUS_CHOICES = [('ACTIVE', 'Active'), ('PAUSED', 'Paused'), ('CANCELLED', 'Cancelled')]
    
    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=20)
    delivery_zone = models.ForeignKey(TownCoordinator, on_delete=models.SET_NULL, null=True)
    package = models.ForeignKey(Package, on_delete=models.SET_NULL, null=True)
    package_tier = models.CharField(max_length=100)  # e.g. "Nyumbani Standard"
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES)
    next_delivery_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer_name} - {self.package_tier} ({self.frequency})"
