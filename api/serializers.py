from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Patient, Doctor, Appointment, Consultation, MedicalRecord, ChatSession, ChatMessage, ApiRecord, DoctorAvailability

User = get_user_model()

from rest_framework.validators import UniqueValidator

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(
        validators=[UniqueValidator(queryset=User.objects.all(), message="Ce nom d'utilisateur est déjà pris.")]
    )
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all(), message="Cette adresse email est déjà utilisée.")]
    )
    password1 = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)
    specialty = serializers.CharField(required=False, allow_blank=True)
    license_number = serializers.CharField(required=False, allow_blank=True)
    experience = serializers.CharField(required=False, allow_blank=True)
    telephone = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        # Création de l'utilisateur
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password1'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data['role']
        )
        
        # Création du profil associé
        try:
            if validated_data['role'] == 'doctor':
                exp = validated_data.get('experience')
                exp_years = int(exp) if exp and exp.isdigit() else 0
                
                Doctor.objects.create(
                    user=user,
                    specialty=validated_data.get('specialty', 'Généraliste'),
                    license_number=validated_data.get('license_number', ''),
                    experience_years=exp_years,
                    phone=validated_data.get('telephone', '')
                )
            else:
                Patient.objects.create(
                    user=user,
                    phone=validated_data.get('telephone', '')
                )
        except Exception as e:
            # Si le profil échoue, on supprime l'utilisateur pour éviter les doublons orphelins
            user.delete()
            raise serializers.ValidationError({"error": f"Erreur lors de la création du profil: {str(e)}"})
            
        return user

class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorAvailability
        fields = ['id', 'doctor', 'day', 'start_time', 'end_time', 'is_booked']

class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Patient
        fields = ['id', 'user', 'phone', 'blood_group']

class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Doctor
        fields = ['id', 'user', 'specialty', 'license_number', 'experience_years', 'phone']

class AppointmentSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    doctor = DoctorSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'patient', 'doctor', 'date', 'reason']

class ConsultationSerializer(serializers.ModelSerializer):
    appointment = AppointmentSerializer(read_only=True)

    class Meta:
        model = Consultation
        fields = ['id', 'appointment', 'notes', 'created_at']

class MedicalRecordSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    doctor = DoctorSerializer(read_only=True)

    class Meta:
        model = MedicalRecord
        fields = ['id', 'patient', 'doctor', 'diagnosis', 'prescription', 'created_at']

class ChatSessionSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)

    class Meta:
        model = ChatSession
        fields = ['id', 'patient', 'started_at']

class ChatMessageSerializer(serializers.ModelSerializer):
    session = ChatSessionSerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'session', 'sender', 'content', 'timestamp']

class ApiRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApiRecord
        fields = ['id', 'endpoint', 'request_data', 'response_data', 'timestamp']
