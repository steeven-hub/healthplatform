from django.db import models
from users.models import User

class Doctor(models.Model):

    user = models.OneToOneField(User,on_delete=models.CASCADE)
    specialite = models.CharField(max_length=100)

    def __str__(self):
        return self.user.nom