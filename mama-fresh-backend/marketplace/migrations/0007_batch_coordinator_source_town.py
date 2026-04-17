import django.db.models.deletion
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('marketplace', '0005_package_order_customer_ip'),
    ]

    operations = [
        migrations.CreateModel(
            name='Collection',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('product_names', models.JSONField(default=list)),
                ('is_active', models.BooleanField(default=True)),
                ('order', models.PositiveIntegerField(default=0)),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        migrations.CreateModel(
            name='Mix',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('slug', models.SlugField(max_length=200, unique=True)),
                ('description', models.CharField(max_length=500)),
                ('items', models.JSONField(default=list)),
                ('image_url', models.CharField(blank=True, max_length=500)),
                ('order', models.PositiveIntegerField(default=0)),
            ],
            options={
                'verbose_name_plural': 'Mixes',
                'ordering': ['order'],
            },
        ),
        migrations.CreateModel(
            name='OrderBatch',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('batch_date', models.DateField(auto_now_add=True)),
                ('status', models.CharField(choices=[('OPEN', 'Open'), ('DISPATCHED', 'Dispatched'), ('DELIVERED', 'Delivered')], default='OPEN', max_length=20)),
                ('is_express', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('dispatched_at', models.DateTimeField(blank=True, null=True)),
                ('notes', models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Testimonial',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('quote', models.TextField()),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='TownCoordinator',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('town', models.CharField(max_length=100, unique=True)),
                ('coordinator_name', models.CharField(max_length=200)),
                ('whatsapp_number', models.CharField(max_length=20)),
                ('pin', models.CharField(default='0000', max_length=6)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.AddField(
            model_name='order',
            name='is_express',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='product',
            name='is_available',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='product',
            name='source_town',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        migrations.AddField(
            model_name='vendor',
            name='is_verified',
            field=models.BooleanField(default=True),
        ),
        migrations.CreateModel(
            name='BatchVendorAssignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('town', models.CharField(max_length=100)),
                ('vendor_name', models.CharField(max_length=200)),
                ('vendor_whatsapp', models.CharField(max_length=20)),
                ('product_name', models.CharField(max_length=200)),
                ('unit', models.CharField(max_length=50)),
                ('quantity', models.DecimalField(decimal_places=2, max_digits=10)),
                ('source_town', models.CharField(blank=True, max_length=100)),
                ('is_absent', models.BooleanField(default=False)),
                ('reassigned_product', models.CharField(blank=True, max_length=200)),
                ('whatsapp_sent', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('batch', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assignments', to='marketplace.orderbatch')),
            ],
        ),
        migrations.AddField(
            model_name='order',
            name='batch',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='orders', to='marketplace.orderbatch'),
        ),
    ]
