from django.db import models
from patients.models import Patient
from doctors.models import Doctor

class Appointment(models.Model):

    patient = models.ForeignKey(Patient,on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor,on_delete=models.CASCADE)

    date = models.DateField()
    heure = models.TimeField()
    statut = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.patient} - {self.doctor}"