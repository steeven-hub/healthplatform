from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# Modèle pour l'audit des appels API (n'a pas de place ailleurs pour l'instant)
class ApiRecord(models.Model):
    endpoint = models.CharField(max_length=200)
    request_data = models.TextField(default="")
    response_data = models.TextField(default="")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"API call {self.endpoint} ({self.timestamp})"
