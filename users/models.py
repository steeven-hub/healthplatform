from django.db import models

class User(models.Model):

    ROLE_CHOICES = [
        ('PATIENT','Patient'),
        ('DOCTOR','Doctor'),
        ('ADMIN','Admin')
    ]

    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    telephone = models.CharField(max_length=20)

    def __str__(self):
        return self.nom