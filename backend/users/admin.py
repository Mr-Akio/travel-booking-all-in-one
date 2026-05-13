from django.contrib import admin
from django.utils.html import format_html
from .models import TourPackage, Booking, Payment, UserProfile, TourPackageImage
from .models import Review
from django.utils.html import format_html
from .models import BlogPost

# -----------------------------
# Inline 
# -----------------------------
class TourPackageImageInline(admin.TabularInline):
    model = TourPackageImage
    extra = 1

# -----------------------------
# TourPackage Admin
# -----------------------------
@admin.register(TourPackage)
class TourPackageAdmin(admin.ModelAdmin):
    inlines = [TourPackageImageInline]
    list_display = ['title', 'location', 'price', 'available', 'start_date', 'end_date', 'owner']
    search_fields = ['title', 'location', 'owner__username', 'owner__email']
    list_filter  = ['available', 'start_date', 'end_date', 'owner']

   
    fields = (
        "owner",                             
        "title", "description", "activities", "includes", "excludes",
        "price", "location", "start_date", "end_date", "image", "slots", "available",
        "duration_detail", "group_size", "languages", "meeting_point",
    )

    
    def save_model(self, request, obj, form, change):
        if not obj.owner:
            obj.owner = request.user
        super().save_model(request, obj, form, change)

    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(owner=request.user)

# -----------------------------
# Action  Booking
# -----------------------------
@admin.action(description="✅ Approve the selected booking")
def approve_bookings(modeladmin, request, queryset):
    updated = queryset.update(status='confirmed')
    modeladmin.message_user(request, f"✔️ approve {updated} Reservation completed")

# -----------------------------
# Booking Admin
# -----------------------------
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'package', 'travel_date', 'number_of_people', 'colored_status')
    list_filter = ('status', 'travel_date')
    search_fields = ['user__username', 'package__title']
    actions = [approve_bookings]

    def colored_status(self, obj):
        color = {
            'pending': 'orange',
            'confirmed': 'green',
            'cancelled': 'red',
        }.get(obj.status, 'black')
        return format_html(f'<b style="color:{color}">{obj.status.upper()}</b>')
    
    colored_status.short_description = 'Status'

# -----------------------------
# Payment Admin
# -----------------------------
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['booking', 'amount', 'payment_method', 'is_paid', 'is_verified', 'paid_at']
    list_filter = ['payment_method', 'is_paid', 'is_verified']
    search_fields = ['booking__user__username', 'booking__package__title']

# -----------------------------
# UserProfile Admin
# -----------------------------
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_agency', 'is_email_verified', 'gender', 'birth_date']
    search_fields = ['user__username', 'phone', 'passport_no', 'nationality']
    list_filter = ['is_agency', 'is_email_verified', 'gender']

    
    def user_username(self, obj):
        return obj.user.username
    user_username.admin_order_field = 'user__username'
    user_username.short_description = 'Username'



@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'package', 'rating', 'created_at']
    search_fields = ['user__username', 'package__title']
    
    


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'is_published', 'created_at')
    list_filter = ('is_published', 'created_at')
    search_fields = ('title', 'author__username')
    prepopulated_fields = {'slug': ('title',)}