from django.db import models
from patients.models import Patient

class MedicalRecord(models.Model):

    patient = models.OneToOneField(Patient,on_delete=models.CASCADE)

    antecedents = models.TextField()
    vaccinations = models.TextField()