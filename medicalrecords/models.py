from django.db import models
from patients.models import Patient
from doctors.models import Doctor

class MedicalRecord(models.Model):
    # On garde ForeignKey si c'est pour l'historique des actes
    patient = models.ForeignKey(
        Patient, 
        on_delete=models.CASCADE, 
        related_name="medical_records"
    )
    # Le docteur qui a créé l'entrée
    doctor = models.ForeignKey(
        Doctor, 
        on_delete=models.SET_NULL, # Si le docteur part, on garde le dossier
        null=True,
        related_name="created_records"
    )
    
    # Ex: "Radiographie", "Analyse de sang", "Antécédent Chirurgical"
    record_type = models.CharField(max_length=100) 
    description = models.TextField()
    
    # Ajout d'un champ pour joindre un fichier (compte-rendu PDF, image radio)
    attachment = models.FileField(upload_to='medical_docs/', null=True, blank=True)
    
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.record_type} - {self.patient.user.last_name} ({self.date_created.strftime('%d/%m/%Y')})"