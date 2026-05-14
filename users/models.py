from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import random

class User(AbstractUser):
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    ROLE_CHOICES = (
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    is_approved = models.BooleanField(default=False)  # validation admin

    def __str__(self):
        return self.username

class EmailVerification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='email_verification')
    code = models.CharField(max_length=7)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        # Le code est valide pendant 10 minutes
        return timezone.now() < self.created_at + timezone.timedelta(minutes=10)

    @staticmethod
    def generate_code():
        return ''.join([str(random.randint(0, 9)) for _ in range(7)])