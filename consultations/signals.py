from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Consultation
from medicalrecords.models import MedicalRecord
from patients.models import Patient
from doctors.models import Doctor

@receiver(post_save, sender=Consultation)
def auto_create_medical_record(sender, instance, created, **kwargs):
    if created:
        # Récupérer ou créer le profil Patient associé
        patient_profile, _ = Patient.objects.get_or_create(user=instance.patient)
        
        # Récupérer le profil Doctor associé
        try:
            doctor_profile = Doctor.objects.get(user=instance.doctor)
        except Doctor.DoesNotExist:
            doctor_profile = None # Ou gérer l'erreur selon vos besoins métier
            
        MedicalRecord.objects.create(
            patient=patient_profile,
            doctor=doctor_profile,
            record_type="Note de Consultation",
            description=f"Diagnostic: {instance.diagnosis}\nSymptômes: {instance.symptoms}"
        )