from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from patients.models import Patient
from doctors.models import Doctor
from medicalrecords.models import MedicalRecord

User = get_user_model()

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_patient_registration(self):
        """Vérifie qu'un patient peut s'inscrire et que son profil est créé."""
        data = {
            "username": "testpatient",
            "email": "patient@test.com",
            "password1": "SecurePass123!",
            "first_name": "Test",
            "last_name": "Patient",
            "role": "patient",
            "telephone": "123456789"
        }
        response = self.client.post('/api/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Vérifier l'utilisateur
        user = User.objects.get(username="testpatient")
        self.assertEqual(user.role, "patient")
        
        # Vérifier le profil Patient (Source de vérité unifiée)
        patient = Patient.objects.get(user=user)
        self.assertEqual(patient.phone, "123456789")

    def test_doctor_registration(self):
        """Vérifie qu'un médecin peut s'inscrire et que son profil est créé."""
        data = {
            "username": "testdoctor",
            "email": "doctor@test.com",
            "password1": "SecurePass123!",
            "first_name": "Test",
            "last_name": "Doctor",
            "role": "doctor",
            "specialty": "Cardiologue",
            "telephone": "987654321",
            "experience": "10"
        }
        response = self.client.post('/api/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Vérifier l'utilisateur
        user = User.objects.get(username="testdoctor")
        self.assertEqual(user.role, "doctor")
        
        # Vérifier le profil Doctor (Source de vérité unifiée)
        doctor = Doctor.objects.get(user=user)
        self.assertEqual(doctor.specialty, "Cardiologue")
        self.assertEqual(doctor.experience_years, 10)

    def test_token_login(self):
        """Vérifie que l'authentification par token fonctionne."""
        # Créer un utilisateur d'abord
        user = User.objects.create_user(username="loginuser", password="password123", role="patient")
        
        data = {
            "username": "loginuser",
            "password": "password123"
        }
        response = self.client.post('/api/token-login/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_patient_detail_api(self):
        """Vérifie que l'endpoint patient-detail fonctionne sans erreur 500."""
        # Créer un médecin et un patient
        doctor_user = User.objects.create_user(username="drtest", password="password123", role="doctor")
        doctor = Doctor.objects.create(user=doctor_user, specialty="Généraliste")
        
        patient_user = User.objects.create_user(username="patest", password="password123", role="patient")
        patient = Patient.objects.create(user=patient_user)
        
        # Créer un dossier médical
        MedicalRecord.objects.create(patient=patient, doctor=doctor, diagnosis="Rhume")
        
        # Authentifier en tant que médecin
        self.client.force_authenticate(user=doctor_user)
        
        response = self.client.get(f'/api/patient-detail/{patient.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], f"{patient_user.first_name} {patient_user.last_name}")
        self.assertTrue(len(response.data['history']) > 0)
        self.assertEqual(response.data['history'][0]['diagnosis'], "Rhume")
