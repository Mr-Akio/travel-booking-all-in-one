from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile

@receiver(post_save, sender=User)
def ensure_user_profile(sender, instance, created, **kwargs):
   
    profile, _ = UserProfile.objects.get_or_create(
        user=instance,
        defaults={"is_agency": False},
    )
   
    if profile.is_agency is None:
        profile.is_agency = False
        profile.save(update_fields=["is_agency"])