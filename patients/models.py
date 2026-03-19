from django.db import models
from users.models import User

class Patient(models.Model):

    user = models.OneToOneField(User,on_delete=models.CASCADE)

    dateNaissance = models.DateField()
    sexe = models.CharField(max_length=10)
    groupeSanguin = models.CharField(max_length=5)
    allergies = models.TextField(blank=True)

    def __str__(self):
        return self.user.nom