from django.db import models
from patients.models import Patient
from doctors.models import Doctor

class MedicalRecord(models.Model):
    patient = models.ForeignKey(
        Patient, 
        on_delete=models.CASCADE, 
        related_name="medical_records"
    )
    doctor = models.ForeignKey(
        Doctor, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_records"
    )
    
    # Fusion des champs de l'API et du modèle original
    record_type = models.CharField(max_length=100, default="General") 
    diagnosis = models.TextField(blank=True, null=True)
    prescription = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    attachment = models.FileField(upload_to='medical_docs/', null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Dossier {self.id} - {self.patient}"
