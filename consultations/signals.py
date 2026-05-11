from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Consultation
from medicalrecords.models import MedicalRecord
from patients.models import Patient

@receiver(post_save, sender=Consultation)
def auto_create_medical_record(sender, instance, created, **kwargs):
    if created:
        # Récupérer ou créer l'instance Patient associée à l'utilisateur
        patient_profile, _ = Patient.objects.get_or_create(user=instance.patient)
        
        MedicalRecord.objects.create(
            patient=patient_profile, # Utilisation de l'instance Patient
            doctor=instance.doctor,
            record_type="Note de Consultation",
            description=f"Diagnostic: {instance.diagnosis}\nSymptômes: {instance.symptoms}"
        )