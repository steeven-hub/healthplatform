from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Consultation
from medicalrecords.models import MedicalRecord

@receiver(post_save, sender=Consultation)
def auto_create_medical_record(sender, instance, created, **kwargs):
    if created:
        MedicalRecord.objects.create(
            patient=instance.patient, # Assure-toi que l'instance a accès au modèle Patient
            doctor=instance.doctor,
            record_type="Note de Consultation",
            description=f"Diagnostic: {instance.diagnosis}\nSymptômes: {instance.symptoms}"
        )