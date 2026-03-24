# patients/serializers.py
from rest_framework import serializers
from .models import Patient

class PatientSerializer(serializers.ModelSerializer):
    # On crée dynamiquement l'objet "constantes" pour le frontend
    constantes = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = [
            'id', 'nom', 'prenom', 'age', 
            'groupeSanguin', 'derniereConsultation', 'constantes'
        ]

    def get_constantes(self, obj):
        return {
            "tension": obj.tension,
            "poids": obj.poids,
            "temperature": obj.temperature
        }