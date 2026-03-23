from django.db import models
from patients.models import Patient
from doctors.models import Doctor

class Appointment(models.Model):
    # On utilise les modèles spécifiques pour avoir accès aux infos médicales
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    
    date = models.DateTimeField()
    reason = models.TextField(null=True, blank=True) # Toujours utile de savoir pourquoi on consulte !
    
    # Utiliser des choix (choices) rend le filtrage plus propre
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('confirmed', 'Confirmé'),
        ('cancelled', 'Annulé'),
        ('completed', 'Terminé'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"RDV: {self.patient} avec Dr. {self.doctor} le {self.date}"