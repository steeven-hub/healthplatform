from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import ChatMessage

@receiver(post_save, sender=ChatMessage)
def notify_new_message(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        session = instance.session
        
        # Trouver le destinataire (l'autre participant de la session)
        recipient = session.participants.exclude(id=instance.sender.id).first()
        
        if recipient:
            group_name = f'notify_{recipient.id}'
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'send_notification',
                    'message': f"Nouveau message de {instance.sender.username}",
                    'data': {
                        'session_id': session.id,
                        'message_preview': instance.message[:50]
                    }
                }
            )