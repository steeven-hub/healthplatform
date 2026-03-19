from django.db import models
from users.models import User

class Notification(models.Model):

    user = models.ForeignKey(User,on_delete=models.CASCADE)

    type = models.CharField(max_length=50)
    message = models.TextField()
    dateEnvoi = models.DateTimeField(auto_now_add=True)