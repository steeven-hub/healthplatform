from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Patient(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="api_patient"
    )
    phone = models.CharField(max_length=20, blank=True, null=True)
    blood_group = models.CharField(max_length=5, blank=True, null=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"

class Doctor(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="api_doctor"
    )
    specialty = models.CharField(max_length=100, default="Généraliste")
    license_number = models.CharField(max_length=50, blank=True, null=True)
    experience_years = models.PositiveIntegerField(default=0)
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"Dr. {self.user.last_name} ({self.specialty})"

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'En attente'),
        ('confirmed', 'Confirmé'),
        ('cancelled', 'Annulé'),
        ('completed', 'Terminé'),
    )
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="appointments")
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="appointments")
    date = models.DateTimeField()
    reason = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"RDV {self.patient} avec {self.doctor} le {self.date} ({self.status})"

class Consultation(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name="consultation")
    notes = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Consultation {self.appointment}"

class MedicalRecord(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="medical_records")
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True, related_name="medical_records")
    diagnosis = models.TextField()
    prescription = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Dossier médical #{self.id} - {self.patient}"

class ChatSession(models.Model):
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="chat_sessions"
    )
    title = models.CharField(max_length=200, default="Nouvelle conversation")
    started_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.patient} ({self.started_at})"

class ChatMessage(models.Model):
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=50)  # "patient" ou "assistant"
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message de {self.sender} ({self.timestamp})"

class DoctorAvailability(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="availabilities")
    day = models.CharField(max_length=20) # ex: "Lundi"
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.doctor} - {self.day} ({self.start_time} - {self.end_time})"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user}: {self.title}"

class ApiRecord(models.Model):
    endpoint = models.CharField(max_length=200)
    request_data = models.TextField(default="")   # valeur par défaut
    response_data = models.TextField(default="")  # valeur par défaut
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"API call {self.endpoint} ({self.timestamp})"
