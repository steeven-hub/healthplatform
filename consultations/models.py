from django.db import models
from django.conf import settings
from appointments.models import Appointment # Importe ton modèle de RDV

class Consultation(models.Model):
    # Lien direct avec le RDV (OneToOne assure qu'un RDV = une seule consultation)
    appointment = models.OneToOneField(
        Appointment, 
        on_delete=models.CASCADE, 
        related_name='consultation_details',
        null=True, blank=True # Permet la flexibilité si besoin
    )
    
    # On garde le patient et le docteur pour un accès rapide (Denormalisation légère)
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_consultations'
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_consultations'
    )
    
    # Champs médicaux essentiels
    diagnosis = models.TextField(verbose_name="Diagnostic")
    prescription = models.TextField(verbose_name="Ordonnance", blank=True)
    symptoms = models.TextField(verbose_name="Symptômes", blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Consultation {self.id} - Dr. {self.doctor.username} / {self.patient.username}"