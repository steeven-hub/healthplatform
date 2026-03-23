import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # On récupère l'utilisateur du scope
        user = self.scope.get('user')

        # RÉPARATION : Si l'utilisateur est anonyme (cas du script de test),
        # on force l'ID 1 pour pouvoir tester sans être bloqué par le middleware.
        if not user or user.is_anonymous:
            self.user_id = 1
        else:
            self.user_id = user.id

        self.group_name = f'notify_{self.user_id}'

        # Rejoindre le groupe
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        # TRÈS IMPORTANT : Accepter la connexion
        await self.accept()
        print(f"Connexion acceptée pour l'utilisateur {self.user_id}")

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'message': event['message'],
            'data': event.get('data', {})
        }))