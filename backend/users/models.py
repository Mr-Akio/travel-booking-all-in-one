from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from django.db.models.signals import post_save


# ✅ signals
from django.dispatch import receiver

# -----------------------
# User Profile
# -----------------------

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_email_verified = models.BooleanField(default=False)
    is_agency = models.BooleanField(default=False)  # ✅

    gender = models.CharField(max_length=10, blank=True, null=True)
    birth_date = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    passport_no = models.CharField(max_length=50, blank=True, null=True)
    nationality = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)

    def __str__(self):
        return self.user.username




# -----------------------
# Tour Package
# -----------------------
class TourPackage(models.Model):
    
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='agency_packages',
        null=True, blank=True
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    image = models.ImageField(upload_to='packages/', null=True, blank=True)
    map_image = models.ImageField(upload_to='maps/', null=True, blank=True)
    slots = models.PositiveIntegerField(default=20)
    available = models.BooleanField(default=True)

    activities = models.TextField(blank=True)
    includes = models.TextField(blank=True)
    excludes = models.TextField(blank=True)
    duration_detail = models.CharField(max_length=100, blank=True)
    group_size = models.CharField(max_length=100, blank=True)
    languages = models.CharField(max_length=100, blank=True)
    meeting_point = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title} ({self.location})"

    @property
    def booked_slots(self):
        return sum(b.number_of_people for b in self.bookings.filter(status='confirmed'))

    @property
    def remaining_slots(self):
        return max(self.slots - self.booked_slots, 0)


# -----------------------
# Booking
# -----------------------
class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    package = models.ForeignKey(TourPackage, on_delete=models.CASCADE, related_name='bookings')
    booking_date = models.DateTimeField(auto_now_add=True)
    travel_date = models.DateField()
    number_of_people = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    note = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} → {self.package.title}"

    def clean(self):
       
        if self.number_of_people <= 0:
            raise ValidationError('จำนวนคนต้องมากกว่า 0')
        if self.number_of_people > self.package.remaining_slots:
            raise ValidationError('จำนวนคนเกินจำนวนที่นั่งที่เหลือ')


# -----------------------
# Payment
# -----------------------
class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('qr', 'QR Code'),
        ('credit', 'Credit Card'),
        ('bank', 'Bank Transfer'),
        ('slip', 'Bank Slip'),
    ]

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES)
    paid_at = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)

    slip_image = models.ImageField(upload_to='payment_slips/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"💵 Payment #{self.id} - {self.amount:.2f} THB"


# -----------------------
# Multiple Images for TourPackage
# -----------------------
class TourPackageImage(models.Model):
    package = models.ForeignKey(TourPackage, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='packages/gallery/')

    def __str__(self):
        return f"📷 {self.package.title} - {self.id}"


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    package = models.ForeignKey(TourPackage, on_delete=models.CASCADE, related_name="reviews")
    rating = models.IntegerField(default=5)  # 1-5
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"⭐ {self.rating} by {self.user.username} on {self.package.title}"


class BlogPost(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    title = models.CharField(max_length=255)
    content = models.TextField()
    image = models.ImageField(upload_to='blog_images/', blank=True, null=True)
    slug = models.SlugField(unique=True, blank=True, null=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title, allow_unicode=True)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
