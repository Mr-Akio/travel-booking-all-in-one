from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework import viewsets, permissions
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import AccessToken, TokenError

from django.template.loader import render_to_string
from django.urls import reverse

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

import qrcode
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
import io

from rest_framework import generics, permissions
from .models import Review
from .serializers import ReviewSerializer

from .serializers import RegisterSerializer 
from rest_framework_simplejwt.exceptions import TokenError

from .models import UserProfile, TourPackage, Booking, Payment
from .serializers import (
    TourPackageSerializer,
    BookingSerializer,
    PaymentSerializer,
)


from django.db import transaction
from django.db.models import F

from django.core.mail import EmailMessage

from django.core.mail import send_mail
from django.urls import reverse
from rest_framework_simplejwt.tokens import AccessToken



from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.template.loader import render_to_string
from django.core.mail import EmailMessage
from django.contrib.auth.models import User


from django.utils.http import urlsafe_base64_decode


from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from django.http import HttpResponse
from .models import Booking
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from django.http import HttpResponse
from .models import Booking
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes


from rest_framework import generics
from .models import BlogPost
from .serializers import BlogPostSerializer



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework import generics, permissions


from rest_framework.generics import RetrieveAPIView
from rest_framework.decorators import api_view, permission_classes, parser_classes

from django.shortcuts import get_object_or_404
from django.db.models import Q


from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import TourPackage
from .serializers import AgencyPackageSerializer


from .serializers import TourPackageSerializer
from .models import TourPackage, TourPackageImage


from datetime import datetime


# ------------------------------
# 🔐 Register
# ------------------------------

@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        send_verification_email(user, request)
        return Response({"message": "Registration successful. Please verify your email."}, status=201)
    return Response(serializer.errors, status=400)



# ------------------------------
# 🔐 Login
# ------------------------------
@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'detail': 'Email and password required'}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'detail': 'Invalid credentials'}, status=401)

   
    if not user.userprofile.is_email_verified:
        return Response({'detail': 'Please verify your email before logging in.'}, status=403)

    user = authenticate(request, username=user.username, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username,
            'email': user.email,
        })
    
    return Response({'detail': 'Invalid credentials'}, status=401)
    
@api_view(['POST'])
def google_login(request):
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    
    token = request.data.get('token')
    if not token:
        return Response({'detail': 'No token provided'}, status=400)
        
    try:
        # 🛡️ Verify the ID token from Google
        # You should replace 'YOUR_GOOGLE_CLIENT_ID' with your actual Client ID if possible, 
        # or leave it for now (it will still work for basic verification in some cases, but best to have it)
        # Note: In production, ALWAYS specify the audience (Client ID)
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request())
        
        email = idinfo['email']
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        picture = idinfo.get('picture', '')
        
        # 👤 Find or Create User
        user, created = User.objects.get_or_create(email=email, defaults={
            'username': email, # use email as username
            'first_name': first_name,
            'last_name': last_name,
        })
        
        # Ensure UserProfile exists
        profile, p_created = UserProfile.objects.get_or_create(user=user)
        profile.is_email_verified = True # Google verified it already
        profile.save()
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username,
            'email': user.email,
        })
        
    except ValueError:
        return Response({'detail': 'Invalid Google token'}, status=400)
    except Exception as e:
        return Response({'detail': str(e)}, status=500)

# ------------------------------
# 👤 Get Profile
# ------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    profile = getattr(user, 'userprofile', None)

    return Response({
        'username': user.username,
        'email': user.email,
        'is_agency': bool(profile and profile.is_agency),   
        'birth_date': profile.birth_date if profile else '',
        'gender': profile.gender if profile else '',
        'phone': profile.phone if profile else '',
        'passport_no': profile.passport_no if profile else '',
        'nationality': profile.nationality if profile else '',
        'address': profile.address if profile else '',
        'profile_picture': profile.profile_picture.url if profile and profile.profile_picture else '',
    })

# ------------------------------
# 👤 Update Profile
# ------------------------------
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_profile(request):
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)

    # ---------------- User fields ----------------
    user.email = request.data.get('email', user.email)
    user.first_name = request.data.get('name', user.first_name)
    user.save()

    # ---------------- Profile fields ----------------
    dob = request.data.get('dob', profile.birth_date)
    if dob:
        try:
            if isinstance(dob, str):
                if '/' in dob:
                    dob = datetime.strptime(dob, '%d/%m/%Y').date()
                else:
                    dob = datetime.strptime(dob, '%Y-%m-%d').date()
        except ValueError:
            dob = profile.birth_date
    profile.birth_date = dob

    profile.gender = request.data.get('gender', profile.gender)
    profile.phone = request.data.get('phone', profile.phone)
    profile.passport_no = request.data.get('passport_no', profile.passport_no)
    profile.nationality = request.data.get('nationality', profile.nationality)
    profile.address = request.data.get('address', profile.address)

    # ---------------- Profile picture ----------------
    if 'profile_picture' in request.FILES:
        profile.profile_picture = request.FILES['profile_picture']

    profile.save()

    return Response({'detail': 'Profile updated successfully.'})


# ------------------------------
# 📦 Create Booking
# ------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):
    """
    สร้าง booking แบบกัน overbook และหัก slots แบบ atomic
    """
    package_id = request.data.get('package_id')
    travel_date = request.data.get('travel_date') 
    try:
        number_of_people = int(request.data.get('number_of_people', 1))
    except (TypeError, ValueError):
        return Response({'detail': 'number_of_people must be an integer'}, status=400)

    if number_of_people <= 0:
        return Response({'detail': 'number_of_people must be >= 1'}, status=400)

    
    with transaction.atomic():
        try:
            package = TourPackage.objects.select_for_update().get(id=package_id)
        except TourPackage.DoesNotExist:
            return Response({'detail': 'Package not found'}, status=404)

        
        package.refresh_from_db()
        if package.slots < number_of_people:
            return Response({'detail': 'Not enough seats available'}, status=400)

        
        package.slots = F('slots') - number_of_people
        package.save(update_fields=['slots'])

        
        data = {
            'package_id': package.id,
            'travel_date': travel_date,
            'number_of_people': number_of_people,
        }
        serializer = BookingSerializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()

    return Response(BookingSerializer(booking).data, status=201)


# ------------------------------
# 📦 My Bookings
# ------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_bookings(request):
    bookings = Booking.objects.filter(user=request.user).order_by('-booking_date')
    return Response(BookingSerializer(bookings, many=True).data)


# ------------------------------
# 📦 Booking Detail
# ------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_detail(request, pk):
    try:
        booking = Booking.objects.get(pk=pk, user=request.user)
    except Booking.DoesNotExist:
        return Response({'detail': 'Booking not found'}, status=404)

    return Response(BookingSerializer(booking).data)


# ------------------------------
# 📦 Update Booking
# ------------------------------
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_booking(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
    except Booking.DoesNotExist:
        return Response({'detail': 'Booking not found'}, status=404)

    booking.note = request.data.get("note", booking.note)
    booking.save()
    
    return Response(BookingSerializer(booking).data)



# ------------------------------
# 💰 Make Payment
# ------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def make_payment(request):
    booking_id = request.data.get('booking_id')
    method = request.data.get('payment_method')

    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
    except Booking.DoesNotExist:
        return Response({'detail': 'Booking not found'}, status=404)

    if hasattr(booking, 'payment'):
        return Response({'detail': 'Payment already made'}, status=400)

    payment = Payment.objects.create(
        booking=booking,
        amount=booking.package.price * booking.number_of_people,
        payment_method=method,
        is_paid=True,
    )

    booking.status = 'confirmed'
    booking.save()

    return Response(PaymentSerializer(payment).data, status=201)


# ------------------------------
# 🛆 List Tour Packages
# ------------------------------
@api_view(['GET'])
def list_tour_packages(request):
    packages = TourPackage.objects.filter(available=True)
    serializer = TourPackageSerializer(packages, many=True)
    return Response(serializer.data)



# ------------------------------
# 🛆 Tour Package Detail
# ------------------------------
@api_view(['GET'])
def tour_package_detail(request, pk):
    try:
        package = TourPackage.objects.get(pk=pk)
    except TourPackage.DoesNotExist:
        return Response({'detail': 'Package not found'}, status=404)

    serializer = TourPackageSerializer(package)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_booking_by_id(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
    except Booking.DoesNotExist:
        return Response({'detail': 'Booking not found'}, status=404)

    return Response(BookingSerializer(booking).data)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_payment_slip(request):
    booking_id = request.data.get('booking_id')
    slip = request.FILES.get('slip_image')

    if not slip:
        return Response({'detail': 'No slip image provided'}, status=400)

    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
    except Booking.DoesNotExist:
        return Response({'detail': 'Booking not found'}, status=404)

    if hasattr(booking, 'payment'):
        return Response({'detail': 'Payment already exists'}, status=400)

    payment = Payment.objects.create(
        booking=booking,
        amount=booking.package.price * booking.number_of_people,
        payment_method='slip',
        slip_image=slip,
        is_paid=True,
    )
    booking.status = 'pending' 
    booking.save()

    return Response(PaymentSerializer(payment).data, status=201)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_qr_code(request, booking_id):
    try:
        from .models import Booking
        booking = Booking.objects.get(id=booking_id, user=request.user)
    except Booking.DoesNotExist:
        return HttpResponse("Booking not found", status=404)

    amount = booking.package.price * booking.number_of_people
    text = f"Pay {amount:.2f} THB for booking #{booking.id}"

    qr = qrcode.make(text)
    buffer = io.BytesIO()
    qr.save(buffer, format='PNG')
    buffer.seek(0)

    return HttpResponse(buffer.read(), content_type='image/png')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_qr_code(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
    except Booking.DoesNotExist:
        return HttpResponse("Booking not found", status=404)

    amount = booking.package.price * booking.number_of_people
    promptpay_number = "0621589024"  # เปลี่ยนเป็นเบอร์บัญชีจริง
    payload = f"00020101021229370016A00000067701011102130066{promptpay_number[-9:]}5406{amount:.2f}6304"  # คุณอาจใช้ lib เช่น `promptpay-qr`

    qr = qrcode.make(payload)
    buffer = io.BytesIO()
    qr.save(buffer, format='PNG')
    buffer.seek(0)

    return HttpResponse(buffer.read(), content_type='image/png')






@api_view(['GET'])
def verify_email(request):
    token_str = request.GET.get("token")

    try:
        token = AccessToken(token_str)
        user_id = token['user_id']
        user = User.objects.get(id=user_id)
        user_profile = UserProfile.objects.get(user=user)

        if not user_profile.is_email_verified:
            user_profile.is_email_verified = True
            user_profile.save()

        
        return redirect(f"{settings.FRONTEND_URL}/verify-success")

    except TokenError:
        return redirect(f"{settings.FRONTEND_URL}/verify-failed")
    except Exception:
        return redirect(f"{settings.FRONTEND_URL}/verify-failed")
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def some_secure_api(request):
    if not request.user.userprofile.is_email_verified:
        return Response({"detail": "Please verify your email before accessing this resource."}, status=403)
    return Response({"data": "Access granted!"})



class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PackageReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        package_id = self.kwargs['package_id']
        return Review.objects.filter(package_id=package_id).order_by('-created_at')
    
    
def send_verification_email(user, request):
    from rest_framework_simplejwt.tokens import RefreshToken
    from django.template.loader import render_to_string
    from django.core.mail import EmailMessage
    from django.urls import reverse

    token = RefreshToken.for_user(user).access_token
    verify_url = request.build_absolute_uri(
        reverse('verify_email') + f"?token={str(token)}"
    )

    subject = "🎉 Email Verification for Tour Booking System"
    html_message = render_to_string('emails/verify_email.html', {
        'username': user.username,
        'verify_url': verify_url,
    })

    email = EmailMessage(
        subject=subject,
        body=html_message,
        to=[user.email],
    )
    email.content_subtype = 'html'  
    email.send()



@api_view(['POST'])
def request_password_reset(request):
    email = request.data.get('email', '').strip().lower()

    if not email:
        return Response({"detail": "Please provide an email address"}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"detail": "Email not found in the system"}, status=404)

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    # ✅ เปลี่ยนตรงนี้ จาก reverse(...) เป็น frontend URL
    reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

    subject = "🔐 Reset your password"
    html_message = render_to_string('emails/password_reset_email.html', {
        'username': user.username,
        'reset_link': reset_link,
    })

    email_message = EmailMessage(subject, html_message, to=[user.email])
    email_message.content_subtype = 'html'
    email_message.send()

    return Response({"message": "Password reset link has been sent to your email."}, status=200)


@api_view(['POST'])
def reset_password_confirm(request):
    uidb64 = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)

        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password has been changed successfully."}, status=200)
        else:
            return Response({"detail": "Invalid or expired token"}, status=400)
    except Exception:
        return Response({"detail": "An error occurred"}, status=400)



def send_password_reset_email(user, request):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    reset_link = request.build_absolute_uri(
        reverse('reset_password_confirm') + f'?uid={uid}&token={token}'
    )

    subject = "🔐 Reset your password"
    html_message = render_to_string('emails/password_reset_email.html', {
        'username': user.username,
        'reset_link': reset_link,
    })

    email = EmailMessage(subject, html_message, to=[user.email])
    email.content_subtype = 'html'
    email.send()
    
    


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_booking_pdf(request):
    user = request.user
    bookings = Booking.objects.filter(user=user).select_related('package')

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="booking_summary.pdf"'

    buffer = canvas.Canvas(response, pagesize=A4)
    width, height = A4

    buffer.setTitle("Booking Summary")
    buffer.setFont("Helvetica-Bold", 16)
    buffer.drawString(100, height - 50, f"📋 Booking Summary for {user.username}")

    y = height - 100
    buffer.setFont("Helvetica", 12)

    for booking in bookings:
        package = booking.package
        buffer.drawString(50, y, f"📌 Package: {package.title} @ {package.location}")
        y -= 20
        buffer.drawString(70, y, f"📅 Travel Date: {booking.travel_date} / People: {booking.number_of_people}")
        y -= 20
        buffer.drawString(70, y, f"💬 Status: {booking.status} | Booked on: {booking.booking_date.strftime('%Y-%m-%d')}")
        y -= 30
        if y < 100:
            buffer.showPage()
            y = height - 50

    buffer.save()
    return response


@api_view(['GET'])

@permission_classes([IsAuthenticated])
def download_booking_pdf_by_id(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
    except Booking.DoesNotExist:
        return Response({'detail': 'Booking not found'}, status=404)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="booking_{booking_id}.pdf"'

    pdf = canvas.Canvas(response, pagesize=A4)
    width, height = A4
    y = height - 2 * cm

    pdf.setTitle(f"Booking #{booking.id}")
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawCentredString(width / 2, y, "Booking & Travel Confirmation")
    y -= 1 * cm
    pdf.setFont("Helvetica", 12)
    pdf.drawCentredString(width / 2, y, f"Booking ID: #{booking.id}")
    y -= 1.5 * cm

    pdf.setFont("Helvetica", 12)
    user = request.user
    pdf.drawString(2 * cm, y, f"👤 Name: {user.get_full_name() or user.username}")
    y -= 0.6 * cm
    pdf.drawString(2 * cm, y, f"📧 Email: {user.email}")
    y -= 0.6 * cm
    pdf.drawString(2 * cm, y, f"🗓️ Booking Date: {booking.booking_date.strftime('%Y-%m-%d')}")
    y -= 1 * cm

    package = booking.package
    pdf.drawString(2 * cm, y, f"🧳 Package: {package.title}")
    y -= 0.6 * cm
    pdf.drawString(2 * cm, y, f"📍 Location: {package.location}")
    y -= 0.6 * cm
    pdf.drawString(2 * cm, y, f"📅 Travel Date: {booking.travel_date}")
    y -= 0.6 * cm
    pdf.drawString(2 * cm, y, f"👥 Number of People: {booking.number_of_people}")
    y -= 0.6 * cm
    pdf.drawString(2 * cm, y, f"🕒 Duration: {package.duration if hasattr(package, 'duration') else 'N/A'}")
    y -= 0.6 * cm
    pdf.drawString(2 * cm, y, f"🗣️ Language: {package.language if hasattr(package, 'language') else 'N/A'}")
    y -= 0.6 * cm
    pdf.drawString(2 * cm, y, f"📌 Meeting Point: {package.meeting_point if hasattr(package, 'meeting_point') else 'N/A'}")
    y -= 1 * cm

    total_price = booking.number_of_people * package.price
    pdf.drawString(2 * cm, y, f"💵 Total: {total_price:.2f} THB")
    y -= 0.6 * cm
    pdf.drawString(2 * cm, y, f"🟢 Status: {booking.status.capitalize()}")
    y -= 1 * cm

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(2 * cm, y, "📎 Includes:")
    y -= 0.5 * cm
    pdf.setFont("Helvetica", 12)
    pdf.drawString(3 * cm, y, "- Hotel & breakfast")
    y -= 0.5 * cm
    pdf.drawString(3 * cm, y, "- Transportation in Japan")
    y -= 0.5 * cm
    pdf.drawString(3 * cm, y, "- Entrance tickets")
    y -= 0.8 * cm

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(2 * cm, y, "❌ Excludes:")
    y -= 0.5 * cm
    pdf.setFont("Helvetica", 12)
    pdf.drawString(3 * cm, y, "- Flight tickets")
    y -= 0.5 * cm
    pdf.drawString(3 * cm, y, "- Lunch/dinner")
    y -= 0.5 * cm
    pdf.drawString(3 * cm, y, "- Insurance")
    y -= 1 * cm

    pdf.setFont("Helvetica-Oblique", 12)
    pdf.drawString(2 * cm, y, "Thank you for booking with us 🙏")

    pdf.save()
    return response



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_blog_post(request):
    title = request.data.get('title')
    content = request.data.get('content')
    tags = request.data.get('tags', '')
    image = request.FILES.get('image')

    post = BlogPost.objects.create(
        user=request.user,
        title=title,
        content=content,
        tags=tags,
        image=image
    )
    return Response({'message': 'Blog created', 'id': post.id, 'slug': post.slug})




class BlogPostListCreateView(generics.ListCreateAPIView):
    queryset = BlogPost.objects.filter(is_published=True).order_by('-created_at')
    serializer_class = BlogPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        # Use is_published from request data if provided, otherwise default to True
        is_published = self.request.data.get('is_published', 'true').lower() == 'true'
        serializer.save(author=self.request.user, is_published=is_published)




class BlogPostCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = BlogPostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)



        
        
class BlogPostDetailView(RetrieveAPIView):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    lookup_field = 'slug'
    
    


# ===== AGENCY: My packages (list) =====
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def agency_my_packages(request):
    """List แพ็กเกจของเอเจนซี่ (owner = request.user)"""
    qs = (
        TourPackage.objects
        .filter(owner_id=request.user.id)  
        .order_by('-id')
        .prefetch_related('images')
    )
    data = AgencyPackageSerializer(qs, many=True).data
    return Response(data)


# ===== AGENCY: Create package =====
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])   
def agency_create_package(request):
    """
    สร้างแพ็กเกจ:
      - ฟอร์มฟิลด์ทั่วไปมาจาก request.data (อย่า copy)
      - รูป cover ใช้ฟิลด์ image ใน serializer/model ตามเดิม
      - รูปแกลเลอรีหลายไฟล์อ่านจาก request.FILES.getlist('images')
    """
    serializer = TourPackageSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    obj = serializer.save(owner=request.user)

    
    for f in request.FILES.getlist('images'):
        TourPackageImage.objects.create(package=obj, image=f)

    return Response(TourPackageSerializer(obj, context={'request': request}).data, status=201)


# ===== AGENCY: Package detail (R/U/D) =====
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])   
def agency_package_detail(request, pk):
    """อ่าน/แก้ไข/ลบ เฉพาะแพ็กเกจที่ตัวเองเป็นเจ้าของ"""
    package = get_object_or_404(TourPackage, pk=pk, owner_id=request.user.id)

    if request.method == 'GET':
        return Response(TourPackageSerializer(package, context={'request': request}).data)

    if request.method in ['PUT', 'PATCH']:
        partial = (request.method == 'PATCH')
        serializer = TourPackageSerializer(
            package,
            data=request.data,
            partial=partial,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()

        # --- Handle Gallery (Multiple Images) ---
        new_images = request.FILES.getlist('images')
        if new_images:
            # Delete old images to replace them
            obj.images.all().delete()
            for f in new_images:
                TourPackageImage.objects.create(package=obj, image=f)

        return Response(TourPackageSerializer(obj, context={'request': request}).data)

    # DELETE
    package.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ===== AGENCY: Upload gallery image =====
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def agency_add_gallery_image(request, pk):
    """อัปโหลดรูปเข้าคลังของแพ็กเกจ (ต้องเป็น owner)"""
    from .models import TourPackageImage
    from .serializers import TourPackageImageSerializer

    package = get_object_or_404(TourPackage, pk=pk, owner_id=request.user.id)

    file_obj = request.FILES.get('image')
    if not file_obj:
        return Response({'detail': 'No image file'}, status=status.HTTP_400_BAD_REQUEST)

    img = TourPackageImage.objects.create(package=package, image=file_obj)
    return Response(TourPackageImageSerializer(img, context={'request': request}).data, status=status.HTTP_201_CREATED)


# ===== AGENCY: Bookings list =====
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def agency_bookings(request):
    """
    ดูเฉพาะ Booking ที่จอง ‘แพ็กเกจของฉัน’
    supports filter: ?status=pending/confirmed/cancelled  &  ?date_from=YYYY-MM-DD  &  ?date_to=YYYY-MM-DD
    """
    status_q = request.GET.get('status')
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')

    qs = (Booking.objects
          .filter(package__owner_id=request.user.id)
          .select_related('package', 'user')
          .order_by('-booking_date'))

    if status_q:
        qs = qs.filter(status=status_q)
    if date_from:
        qs = qs.filter(booking_date__date__gte=date_from)
    if date_to:
        qs = qs.filter(booking_date__date__lte=date_to)

    return Response(BookingSerializer(qs, many=True).data)


# ===== AGENCY: Update booking status =====
@api_view(['POST', 'PATCH'])   
@permission_classes([IsAuthenticated])
def agency_update_booking_status(request, booking_id):
    """
    body: { "status": "confirmed" | "cancelled" }
    """
    new_status = (request.data.get('status') or '').lower().strip()
    if new_status not in ['confirmed', 'cancelled']:
        return Response({'detail': 'Invalid status'}, status=400)

    booking = get_object_or_404(Booking, id=booking_id, package__owner=request.user)
    booking.status = new_status
    booking.save(update_fields=['status'])

    return Response(BookingSerializer(booking).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def payment_notify_email(request):
  booking_id = request.data.get('booking_id')
 
  return Response({'detail': 'Email queued.'})

# ===== AGENCY: Dashboard Stats =====
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def agency_dashboard_stats(request):
    from django.db.models import Sum, F
    from .models import TourPackage, Booking
    
    # Count packages
    packages_count = TourPackage.objects.filter(owner_id=request.user.id).count()
    
    # Filter bookings for my packages
    bookings_qs = Booking.objects.filter(package__owner_id=request.user.id)
    bookings_count = bookings_qs.count()
    
    # Calculate revenue (confirmed bookings only)
    total_revenue = bookings_qs.filter(status='confirmed').aggregate(
        total=Sum(F('number_of_people') * F('package__price'))
    )['total'] or 0
    
    # Recent activities (Latest 5 bookings)
    recent_bookings = bookings_qs.select_related('package', 'user').order_by('-booking_date')[:5]
    activities = []
    for b in recent_bookings:
        activities.append({
            'id': b.id,
            'type': 'booking',
            'title': f'New Booking: {b.package.title}',
            'desc': f'{b.number_of_people} travelers by {b.user.username}',
            'time': b.booking_date.isoformat(),
            'status': b.status
        })
        
    return Response({
        'packages_count': packages_count,
        'bookings_count': bookings_count,
        'total_revenue': float(total_revenue),
        'activities': activities
    })