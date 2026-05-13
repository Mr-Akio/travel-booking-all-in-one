from django.utils import timezone
from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken



from .models import (
    UserProfile,
    TourPackage,
    TourPackageImage,
    Booking,
    Payment,
    Review,
    BlogPost,
)

# ------------------------------
# Auth / Profile
# ------------------------------

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField()

    def validate(self, data):
        from django.contrib.auth import authenticate

        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not password or (not username and not email):
            raise serializers.ValidationError("Username or email and password required")

        
        if email and not username:
            try:
                user_obj = User.objects.get(email=email)
                username = user_obj.username
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid credentials")

        user = authenticate(username=username, password=password)
        if not user or not user.is_active:
            raise serializers.ValidationError("Invalid credentials")

        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'username','email','is_agency',
            'gender','birth_date','phone','passport_no',
            'nationality','address','profile_picture'
        ]


# ------------------------------
# TourPackage (+ Images)
# ------------------------------

class TourPackageImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TourPackageImage
        fields = ["id", "image"]


class TourPackageSerializer(serializers.ModelSerializer):
    images = TourPackageImageSerializer(many=True, read_only=True)
    remaining_slots = serializers.IntegerField(read_only=True)
    booked_slots = serializers.IntegerField(read_only=True)

    agency_name = serializers.SerializerMethodField()
    agency_slug = serializers.SerializerMethodField()

    class Meta:
        model = TourPackage
        fields = [
            "id", "owner",
            "title", "description", "price", "location",
            "start_date", "end_date",
            "image", "images",
            "map_image",               
            "slots", "available",
            "activities", "includes", "excludes",
            "duration_detail", "group_size", "languages", "meeting_point",
            "booked_slots", "remaining_slots",
            "agency_name", "agency_slug",
        ]
        read_only_fields = ["id", "booked_slots", "remaining_slots", "images"]

    def get_agency_name(self, obj):
        try:
            return obj.owner.username
        except Exception:
            return None

    def get_agency_slug(self, obj):
        return None


class AgencyPackageSerializer(serializers.ModelSerializer):
    images = TourPackageImageSerializer(many=True, read_only=True)
    remaining_slots = serializers.IntegerField(read_only=True)
    booked_slots = serializers.IntegerField(read_only=True)
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    
    gallery = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    class Meta:
        model = TourPackage
        fields = [
            "id",
            "owner",
            "title",
            "description",
            "price",
            "location",
            "start_date",
            "end_date",
            "image",
            "map_image",          
            "slots",
            "available",
            "activities",
            "includes",
            "excludes",
            "duration_detail",
            "group_size",
            "languages",
            "meeting_point",
            "images",
            "booked_slots",
            "remaining_slots",
            "gallery",
        ]
        read_only_fields = ["id", "owner", "booked_slots", "remaining_slots", "images"]

    def validate(self, attrs):
        start = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if start and end and start > end:
            raise serializers.ValidationError("start_date must be before end_date")
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        gallery = validated_data.pop("gallery", [])
        pkg = super().create(validated_data)
        for img in gallery:
            TourPackageImage.objects.create(package=pkg, image=img)
        return pkg

    @transaction.atomic
    def update(self, instance, validated_data):
        gallery = validated_data.pop("gallery", None)
        pkg = super().update(instance, validated_data)
        if gallery is not None:
            for img in gallery:
                TourPackageImage.objects.create(package=pkg, image=img)
        return pkg

# ------------------------------
# Booking
# ------------------------------

class BookingSerializer(serializers.ModelSerializer):
    package = TourPackageSerializer(read_only=True)
    package_id = serializers.PrimaryKeyRelatedField(
        queryset=TourPackage.objects.all(),
        source="package",
        write_only=True,
    )

    class Meta:
        model = Booking
        fields = [
            "id",
            "user",
            "package",
            "package_id",
            "booking_date",
            "travel_date",
            "number_of_people",
            "status",
            "note",
        ]
        read_only_fields = ["id", "user", "booking_date", "status", "package"]

    def validate(self, attrs):
        package = attrs.get("package") or getattr(self.instance, "package", None)
        travel_date = attrs.get("travel_date") or getattr(self.instance, "travel_date", None)
        number_of_people = attrs.get("number_of_people") or getattr(self.instance, "number_of_people", 1)

        if package and travel_date:
            if not (package.start_date <= travel_date <= package.end_date):
                raise serializers.ValidationError("travel_date must be within package date range.")

        if number_of_people <= 0:
            raise serializers.ValidationError("number_of_people must be >= 1")

        return attrs

    def create(self, validated_data):
       
        user = self.context["request"].user
        return Booking.objects.create(user=user, **validated_data)


# ------------------------------
# Payment
# ------------------------------

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ["id", "paid_at", "is_verified"]


# ------------------------------
# Review
# ------------------------------

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Review
        fields = ["id", "username", "package", "rating", "comment", "created_at"]
        read_only_fields = ["id", "user", "created_at"]


# ------------------------------
# Blog
# ------------------------------

class BlogPostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            "id",
            "title",
            "slug",
            "content",
            "image",
            "created_at",
            "updated_at",
            "is_published",
            "author_name",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at", "author_name"]
