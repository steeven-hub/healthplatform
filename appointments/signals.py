from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Appointment
from chat.models import ChatSession

@receiver(post_save, sender=Appointment)
def create_chat_on_confirmation(sender, instance, created, **kwargs):
    # Si le rendez-vous passe à 'confirmed', on ouvre la discussion
    if instance.status == 'confirmed':
        # On vérifie si une session existe déjà pour éviter les doublons
        session, created = ChatSession.objects.get_or_create(id=instance.id) 
        if created:
            session.participants.add(instance.patient.user, instance.doctor.user)