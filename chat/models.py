from django.db import models
from django.conf import settings
from patients.models import Patient

class ChatSession(models.Model):
    # Pour le chat entre humains
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="standard_chat_sessions")
    
    # Pour le chat avec l'IA (utilisé par l'API)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="chat_sessions", null=True, blank=True)
    title = models.CharField(max_length=200, default="Nouvelle conversation")
    
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(auto_now_add=True, null=True) # Alias pour compatibilité API

    def __str__(self):
        return f"ChatSession {self.id} - {self.title}"

class ChatMessage(models.Model):
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    
    # Pour le chat entre humains
    sender_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    
    # Pour le chat avec l'IA (compatibilité API)
    sender = models.CharField(max_length=50, blank=True, null=True)  # "patient" ou "assistant"
    content = models.TextField() # Alias pour 'message'
    
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message {self.id} from {self.sender or self.sender_user}"
