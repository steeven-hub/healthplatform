from django.db import models
from users.models import User
from patients.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment
from consultations.models import Consultation

class ApiRecord(models.Model):
    """Un exemple de modèle central pour l'API"""
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='api_records')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='api_records')
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True)
    consultation = models.ForeignKey(Consultation, on_delete=models.SET_NULL, null=True, blank=True)
    data = models.JSONField(default=dict, blank=True)  # stocke les infos structurées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.patient.user.username} - {self.doctor.user.username} - {self.created_at.strftime('%Y-%m-%d')}"