import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatSession, ChatMessage
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.room_group_name = f'chat_{self.session_id}'

        # Rejoindre le groupe de la session
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Quitter le groupe
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Recevoir un message depuis le WebSocket (Frontend ou Script de test)
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')
        
        # RÉPARATION : Gestion de l'utilisateur anonyme pour tes tests terminaux
        user = self.scope['user']
        if user.is_anonymous:
            # Pour le développement, on utilise l'admin (ID 1) si non connecté
            sender_id = 1 
        else:
            sender_id = user.id

        if message:
            # Enregistrer en base de données de manière asynchrone
            await self.save_message(sender_id, message)

            # Envoyer le message à tout le groupe (Patient + Docteur)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender_id': sender_id
                }
            )

    # Méthode appelée par group_send
    async def chat_message(self, event):
        # Envoyer le message au WebSocket de l'utilisateur
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_id': event['sender_id']
        }))

    @database_sync_to_async
    def save_message(self, sender_id, message):
        try:
            session = ChatSession.objects.get(id=self.session_id)
            sender = User.objects.get(id=sender_id)
            
            # Créer le message avec les nouveaux champs
            new_msg = ChatMessage.objects.create(
                session=session,
                sender_user=sender,
                content=message
            )

            # Notifier les autres participants
            from notifications.models import Notification
            other_participants = session.participants.exclude(id=sender_id)
            for participant in other_participants:
                Notification.objects.create(
                    user=participant,
                    title=f"Nouveau message de {sender.first_name or sender.username}",
                    message=f"Vous avez reçu un nouveau message dans votre conversation."
                )
            
            return new_msg
        except Exception as e:
            print(f"Erreur lors de l'enregistrement du message : {e}")
            return None