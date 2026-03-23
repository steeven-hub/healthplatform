from rest_framework import serializers
from .models import ChatSession, ChatMessage
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatMessageSerializer(serializers.ModelSerializer):
    # On ajoute le nom de l'envoyeur pour l'affichage facile
    sender_name = serializers.ReadOnlyField(source='sender.username')

    class Meta:
        model = ChatMessage
        fields = ['id', 'session', 'sender', 'sender_name', 'message', 'timestamp']

class ChatSessionSerializer(serializers.ModelSerializer):
    # Affiche la liste des messages liés à cette session
    messages = ChatMessageSerializer(many=True, read_only=True, source='chatmessage_set')
    # Optionnel : détails sur les participants (noms au lieu de simples IDs)
    participant_names = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='username',
        source='participants'
    )

    class Meta:
        model = ChatSession
        fields = ['id', 'participants', 'participant_names', 'messages', 'created_at']