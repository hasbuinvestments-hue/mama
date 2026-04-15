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
    customer_phone = models.CharField(max_length=20)
    location = models.TextField()
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='UNPAID')
    mpesa_code = models.CharField(max_length=20, null=True, blank=True)
    items = models.JSONField()
    vendor_assignments = models.JSONField(null=True, blank=True)
    customer_ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

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
