from django.db import models


class ChatSession(models.Model):
    dateDebut = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session {self.id}"


class ChatMessage(models.Model):
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE)
    sender = models.CharField(max_length=50)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message