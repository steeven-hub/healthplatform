from django.db import models
from patients.models import Patient   # Import du modèle Patient
from doctors.models import Doctor     # Import du modèle Doctor

class MedicalRecord(models.Model):
    patient = models.ForeignKey(
        Patient, 
        on_delete=models.CASCADE, 
        related_name="medical_records"
    )
    doctor = models.ForeignKey(
        Doctor, 
        on_delete=models.CASCADE, 
        related_name="medical_records"
    )
    record_type = models.CharField(max_length=100)
    description = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Record {self.id}"