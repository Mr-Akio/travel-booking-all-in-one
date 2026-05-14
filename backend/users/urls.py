from django.urls import path  
from . import views
from .views import download_booking_pdf_by_id, verify_email
from .views import ReviewCreateView, PackageReviewListView , generate_booking_pdf ,download_booking_pdf_by_id , BlogPostCreateView ,BlogPostListCreateView, BlogPostDetailView

urlpatterns = [
    # Auth
    path('register/', views.register),
    path('login/', views.login_view),
    path('google-login/', views.google_login),

    # Profile
    path('me/', views.get_profile),
    path('profile/', views.get_profile, name='get_profile'),
    path('profile/update/', views.update_profile),

    # Tour Packages
    path('packages/', views.list_tour_packages),
    path('packages/<int:pk>/', views.tour_package_detail, name='tour_package_detail'),

    # Booking & Payment
    path('bookings/create/', views.create_booking, name='create_booking'),
    path('bookings/my/', views.my_bookings, name='my_bookings'),
    path('bookings/update/<int:booking_id>/', views.update_booking, name='update_booking'),  
    path('bookings/<int:booking_id>/', views.get_booking_by_id, name='get_booking_by_id'),
    path('payments/', views.make_payment, name='make_payment'),
    path('payments/upload/', views.upload_payment_slip, name='upload_payment_slip'),
    
    # QR PromptPay
    path('qr/<int:booking_id>/', views.generate_qr_code, name='generate_qr_code'),
    
    # Reviews
    path('reviews/create/', ReviewCreateView.as_view()),
    path('reviews/package/<int:package_id>/', PackageReviewListView.as_view()),
    
    # ✅ Email Verification & Password Reset
    path('verify-email/', views.verify_email, name='verify_email'),
    path('reset-password/', views.request_password_reset, name='request_password_reset'),
    path('reset-password-confirm/', views.reset_password_confirm, name='reset_password_confirm'),
    
    # ✅ PDF Generation
    path('bookings/pdf/', generate_booking_pdf, name='generate_booking_pdf'),
    path('bookings/<int:booking_id>/pdf/', download_booking_pdf_by_id, name='download_booking_pdf_by_id'),


    
    path('blog/posts/', BlogPostListCreateView.as_view(), name='blog_posts'),
    path('blog/posts/<slug:slug>/', BlogPostDetailView.as_view(), name='blog-detail'),
    
    # AGENCY endpoints
    path('agency/packages/', views.agency_my_packages, name='agency_my_packages'),
    path('agency/packages/create/', views.agency_create_package, name='agency_create_package'),
    path('agency/packages/<int:pk>/', views.agency_package_detail, name='agency_package_detail'),
    path('agency/packages/<int:pk>/images/', views.agency_add_gallery_image, name='agency_add_gallery_image'),

    path('agency/bookings/', views.agency_bookings, name='agency_bookings'),
    path('agency/bookings/<int:booking_id>/status/', views.agency_update_booking_status, name='agency_update_booking_status'),
    path('agency/stats/', views.agency_dashboard_stats, name='agency_dashboard_stats'),

   
    
    
]
