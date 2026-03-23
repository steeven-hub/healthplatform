from rest_framework import serializers
from consultations.models import Consultation
from appointments.models import Appointment

class ConsultationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultation
        fields = '__all__'

    def create(self, validated_data):
        # 1. On crée la consultation normalement
        consultation = super().create(validated_data)
        
        # 2. Si un rendez-vous est lié, on change son statut en 'completed'
        if consultation.appointment:
            appointment = consultation.appointment
            appointment.status = 'completed'
            appointment.save()
            
        return consultation