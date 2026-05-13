import os
import requests
import json
import stripe
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.db import models # Ajouté pour models.Q

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

# Configuration Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

class CreateCheckoutSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            # Créer une session Stripe
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'eur',
                        'unit_amount': 5000, # 50.00 EUR
                        'product_data': {
                            'name': 'Consultation Médicale',
                        },
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url='http://localhost:5173/app/dashboard?success=true',
                cancel_url='http://localhost:5173/app/book-appointment?canceled=true',
            )
            return Response({'url': checkout_session.url}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from patients.models import Patient
from doctors.models import Doctor, DoctorAvailability
from appointments.models import Appointment
from consultations.models import Consultation
from medicalrecords.models import MedicalRecord
from chat.models import ChatSession, ChatMessage
from notifications.models import Notification
from .models import ApiRecord
from .serializers import *

User = get_user_model()

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    """Point de terminaison public pour le monitoring du service (Render)."""
    return Response({
        'status': 'ok', 
        'timestamp': timezone.now(),
        'service': 'AfriHealth API'
    })

@api_view(['POST', 'GET'])
@permission_classes([permissions.AllowAny])
@csrf_exempt
def register_view(request):
    if request.method == 'POST':
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response({'message': "Compte créé avec succès !"}, status=201)
            except Exception as e:
                return Response({'error': str(e)}, status=400)
        return Response(serializer.errors, status=400)
    return render(request, 'register.html')

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_me(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': user.role 
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_or_create_consultation(request, appointment_id):
    """
    Endpoint pour obtenir ou créer une consultation associée à un rendez-vous.
    Cela garantit que l'ID de consultation est toujours valide.
    """
    from consultations.models import Consultation
    from appointments.models import Appointment
    
    appointment = get_object_or_404(Appointment, id=appointment_id)
    
    # Vérification simple des permissions (docteur ou patient du RDV)
    if request.user != appointment.doctor.user and request.user != appointment.patient.user:
        return Response({"error": "Non autorisé"}, status=status.HTTP_403_FORBIDDEN)
        
    consultation, created = Consultation.objects.get_or_create(
        appointment=appointment,
        defaults={
            'patient': appointment.patient.user,
            'doctor': appointment.doctor.user,
            'diagnosis': "Consultation en attente"
        }
    )
    
    return Response({"consultation_id": consultation.id})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats_api(request):
    try:
        today = timezone.now().date()
        user = request.user
        query = request.query_params.get('search', '')
        
        doctor = getattr(user, 'api_doctor', None)
        patient = getattr(user, 'api_patient', None)
        
        if doctor:
            total_patients = Patient.objects.count()
            start_of_day = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.min.time()))
            end_of_day = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.max.time()))
            
            today_appointments = Appointment.objects.filter(doctor=doctor, date__range=(start_of_day, end_of_day)).order_by('date')
            
            if query:
                today_appointments = today_appointments.filter(
                    models.Q(patient__user__first_name__icontains=query) |
                    models.Q(patient__user__last_name__icontains=query) |
                    models.Q(reason__icontains=query)
                )

            appts_data = []
            for appt in today_appointments:
                try:
                    # Garantir qu'une consultation existe pour chaque RDV aujourd'hui
                    consultation, _ = Consultation.objects.get_or_create(
                        appointment=appt,
                        defaults={
                            'patient': appt.patient.user,
                            'doctor': appt.doctor.user,
                            'diagnosis': "Consultation en attente"
                        }
                    )
                    
                    p_name = f"{appt.patient.user.first_name} {appt.patient.user.last_name}"
                    appts_data.append({
                        'id': consultation.id, # ID de la consultation pour la vidéo
                        'appointment_id': appt.id,
                        'patient_name': p_name.strip() or appt.patient.user.username,
                        'patient_id': f"P-{appt.patient.id}",
                        'time': appt.date.strftime('%H:%M'),
                        'type': (appt.reason or "Consultation")[:30],
                        'status': appt.get_status_display()
                    })
                except Exception as e:
                    print(f"DEBUG: Erreur création consultation auto: {e}")
                    continue

            return Response({
                'role': 'doctor',
                'stats': [
                    {'label': "Mes Patients", 'value': str(total_patients), 'icon': 'Users', 'color': 'primary'},
                    {'label': "RDV Aujourd'hui", 'value': str(today_appointments.count()), 'icon': 'Calendar', 'color': 'secondary'},
                    {'label': "Consultations", 'value': str(Consultation.objects.filter(appointment__doctor=doctor).count()), 'icon': 'Activity', 'color': 'chart-3'},
                    {'label': "Capacité", 'value': "95%", 'icon': 'TrendingUp', 'color': 'primary'},
                ],
                'today_patients': appts_data,
                'urgent_patients': []
            })
            
        elif patient:
            my_appointments = Appointment.objects.filter(patient=patient).order_by('-date')
            my_records = MedicalRecord.objects.filter(patient=patient).order_by('-date_created')
            
            if query:
                my_appointments = my_appointments.filter(
                    models.Q(doctor__user__first_name__icontains=query) |
                    models.Q(doctor__user__last_name__icontains=query) |
                    models.Q(reason__icontains=query)
                )
                my_records = my_records.filter(
                    models.Q(diagnosis__icontains=query) |
                    models.Q(prescription__icontains=query) |
                    models.Q(doctor__user__last_name__icontains=query)
                )

            appts_data = []
            for a in my_appointments:
                try:
                    # Garantir qu'une consultation existe pour le patient aussi
                    consultation, _ = Consultation.objects.get_or_create(
                        appointment=a,
                        defaults={
                            'patient': a.patient.user,
                            'doctor': a.doctor.user,
                            'diagnosis': "Consultation en attente"
                        }
                    )
                    appts_data.append({
                        'id': consultation.id, # ID de la consultation
                        'appointment_id': a.id,
                        'patient_name': f"Dr. {a.doctor.user.last_name}", # On réutilise patient_name pour le label frontend
                        'time': a.date.strftime('%H:%M'),
                        'date': a.date.strftime('%d/%m/%Y'),
                        'type': a.reason,
                        'status': a.status
                    })
                except: continue

            records_data = []
            for r in my_records[:5]:
                records_data.append({
                    'id': r.id,
                    'diagnosis': r.diagnosis,
                    'prescription': r.prescription.split('\n') if r.prescription else [],
                    'doctor': str(r.doctor),
                    'date': r.date_created.strftime('%d/%m/%Y')
                })

            return Response({
                'role': 'patient',
                'stats': [
                    {'label': "Mes RDV", 'value': str(my_appointments.count()), 'icon': 'Calendar', 'color': 'primary'},
                    {'label': "Mon Groupe", 'value': getattr(patient, 'blood_group', 'N/A') or "N/A", 'icon': 'Activity', 'color': 'secondary'},
                    {'label': "Documents", 'value': str(MedicalRecord.objects.filter(patient=patient).count()), 'icon': 'FileText', 'color': 'chart-3'},
                ],
                'my_appointments': appts_data,
                'my_records': records_data
            })
            
        else:
            return Response({
                'role': 'admin' if user.is_staff else 'user',
                'stats': [
                    {'label': "Patients Totaux", 'value': str(Patient.objects.count()), 'icon': 'Users', 'color': 'primary'},
                    {'label': "Médecins", 'value': str(Doctor.objects.count()), 'icon': 'Activity', 'color': 'secondary'},
                ],
                'message': "Accès administrateur"
            })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def patient_detail_api(request, patient_id):
    user = request.user
    if patient_id == 'my-profile':
        if hasattr(user, 'api_doctor'):
            doc = user.api_doctor
            return Response({
                'id': doc.id,
                'role': 'doctor',
                'specialty': doc.specialty,
                'license_number': doc.license_number,
                'phone': doc.phone
            })
        elif hasattr(user, 'api_patient'):
            patient = user.api_patient
        else:
            return Response({'error': 'Compte sans profil.'}, status=404)
        
        records = MedicalRecord.objects.filter(patient=patient).order_by('-date_created')
        consultations = Consultation.objects.filter(patient=patient.user).order_by('-created_at')
        return Response({
            'id': f"P-{patient.id}",
            'name': f"{patient.user.first_name} {patient.user.last_name}",
            'bloodGroup': getattr(patient, 'blood_group', 'N/A') or 'N/A',
            'phone': getattr(patient, 'phone', 'N/A') or 'N/A',
            'age': 45, 'gender': 'M', 'address': 'Abidjan',
            'photo': f"https://api.dicebear.com/7.x/avataaars/svg?seed={patient.user.username}",
            'allergies': [], 'chronicConditions': [],
            'history': [{'id': r.id, 'date': r.date_created.date(), 'doctor': str(r.doctor), 'diagnosis': r.diagnosis, 'prescription': r.prescription.split('\n') if r.prescription else []} for r in records],
            'consultations': [{'id': c.id, 'reason': c.appointment.reason if c.appointment else "Consultation", 'date': c.created_at, 'notes': c.diagnosis} for c in consultations]
        })
    else:
        patient = get_object_or_404(Patient, id=str(patient_id).replace('P-', ''))
        
        is_doctor = hasattr(user, 'api_doctor')
        is_owner = hasattr(user, 'api_patient') and user.api_patient.id == patient.id
        
        if not (user.is_superuser or is_doctor or is_owner):
            return Response({'error': 'Accès interdit'}, status=403)
    
        records = MedicalRecord.objects.filter(patient=patient).order_by('-date_created')
        consultations = Consultation.objects.filter(patient=patient.user).order_by('-created_at')
        
        return Response({
            'id': f"P-{patient.id}",
            'name': f"{patient.user.first_name} {patient.user.last_name}",
            'bloodGroup': getattr(patient, 'blood_group', 'N/A') or 'N/A',
            'phone': getattr(patient, 'phone', 'N/A') or 'N/A',
            'age': 45, 'gender': 'M', 'address': 'Abidjan',
            'photo': f"https://api.dicebear.com/7.x/avataaars/svg?seed={patient.user.username}",
            'allergies': [], 'chronicConditions': [],
            'history': [{'id': r.id, 'date': r.date_created.date(), 'doctor': str(r.doctor), 'diagnosis': r.diagnosis, 'prescription': r.prescription.split('\n') if r.prescription else []} for r in records],
            'consultations': [{'id': c.id, 'reason': c.appointment.reason if c.appointment else "Consultation", 'date': c.created_at, 'notes': c.diagnosis} for c in consultations]
        })
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_medical_record_api(request):
    if not hasattr(request.user, 'api_doctor'): return Response({'error': 'Seul médecin'}, status=403)
    data = request.data
    patient = get_object_or_404(Patient, id=str(data.get('patient_id')).replace('P-', ''))
    record = MedicalRecord.objects.create(patient=patient, doctor=request.user.api_doctor, diagnosis=data.get('diagnosis'), prescription=data.get('prescription'))
    return Response({'message': 'Dossier créé'}, status=201)

@api_view(['POST', 'GET'])
@permission_classes([permissions.IsAuthenticated])
def availability_api(request):
    if request.method == 'POST':
        if not hasattr(request.user, 'api_doctor'): return Response(status=403)
        DoctorAvailability.objects.create(doctor=request.user.api_doctor, day=request.data.get('day'), start_time=request.data.get('start_time'), end_time=request.data.get('end_time'))
        return Response(status=201)
    
    doctor_id = request.query_params.get('doctor_id')
    query = DoctorAvailability.objects.filter(is_booked=False)
    if doctor_id: query = query.filter(doctor_id=doctor_id)
    elif hasattr(request.user, 'api_doctor'): query = query.filter(doctor=request.user.api_doctor)
    return Response(DoctorAvailabilitySerializer(query, many=True).data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_doctors_api(request):
    query = request.query_params.get('search', '')
    doctors = Doctor.objects.all()
    
    if query:
        doctors = doctors.filter(
            models.Q(user__first_name__icontains=query) |
            models.Q(user__last_name__icontains=query) |
            models.Q(specialty__icontains=query)
        )
        
    return Response([{'id': d.id, 'name': str(d), 'specialty': d.specialty, 'photo': f"https://api.dicebear.com/7.x/avataaars/svg?seed={d.user.username}"} for d in doctors])

@api_view(['POST', 'GET'])
@permission_classes([permissions.IsAuthenticated])
def book_appointment_api(request):
    user = request.user
    patient = getattr(user, 'api_patient', None)
    if not patient:
        patient = Patient.objects.create(user=user)

    if request.method == 'GET':
        appts = Appointment.objects.filter(patient=patient).order_by('-date')
        return Response([{
            'id': a.id,
            'doctor_name': str(a.doctor),
            'date': a.date.strftime('%d/%m/%Y'),
            'time': a.date.strftime('%H:%M'),
            'reason': a.reason,
            'status': a.status,
            'status_label': a.get_status_display()
        } for a in appts])

    data = request.data
    availability_id = data.get('availability_id')
    avail = get_object_or_404(DoctorAvailability, id=availability_id, is_booked=False)

    appointment = Appointment.objects.create(
        patient=patient,
        doctor=avail.doctor,
        date=timezone.now(), 
        reason=data.get('reason', 'Consultation réservée en ligne'),
        status='pending'
    )

    avail.is_booked = True
    avail.save()

    Notification.objects.create(
        user=avail.doctor.user,
        title="Nouveau Rendez-vous",
        message=f"Le patient {patient} a réservé un créneau pour : {appointment.reason}."
    )

    return Response({
        'message': 'Rendez-vous réservé avec succès !',
        'appointment_id': appointment.id,
        'status': appointment.status
    }, status=201)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_appointment_status_api(request, appointment_id):
    if not hasattr(request.user, 'api_doctor'):
        return Response({'error': 'Seul le médecin peut changer le statut'}, status=403)
    
    appointment = get_object_or_404(Appointment, id=appointment_id, doctor=request.user.api_doctor)
    new_status = request.data.get('status')
    
    if new_status not in dict(Appointment.STATUS_CHOICES):
        return Response({'error': 'Statut invalide'}, status=400)
    
    appointment.status = new_status
    appointment.save()

    status_label = appointment.get_status_display()
    Notification.objects.create(
        user=appointment.patient.user,
        title=f"Rendez-vous {status_label}",
        message=f"Votre rendez-vous avec le {appointment.doctor} prévu le {appointment.date.strftime('%d/%m/%Y')} est désormais {status_label.lower()}."
    )
    
    return Response({
        'id': appointment.id,
        'status': appointment.status,
        'status_label': appointment.get_status_display()
    })

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def notifications_api(request):
    if request.method == 'GET':
        notifs = Notification.objects.filter(user=request.user).order_by('-created_at')[:20]
        return Response([{
            'id': n.id,
            'title': n.title,
            'message': n.message,
            'is_read': n.is_read,
            'created_at': n.created_at
        } for n in notifs])
    
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response(status=204)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_medical_report(request):
    """Génère un rapport ou une ordonnance via l'IA Gemini (Sécurisé)."""
    if not hasattr(request.user, 'api_doctor'):
        return Response({'error': 'Accès réservé aux médecins'}, status=403)
    
    diagnosis = request.data.get('diagnosis')
    report_type = request.data.get('type', 'report')
    
    if not diagnosis:
        return Response({'error': 'Le diagnostic est requis'}, status=400)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={settings.API_KEY}"
    
    prompt = f"Tu es un assistant médical pour AfriHealth. "
    if report_type == 'prescription':
        prompt += f"Génère une ordonnance professionnelle structurée pour le diagnostic suivant : {diagnosis}. Inclut le dosage et la durée."
    else:
        prompt += f"Génère un compte-rendu médical détaillé et professionnel pour le diagnostic suivant : {diagnosis}."
    
    prompt += "\nFormatte la réponse proprement en texte clair avec des sauts de ligne. Sois précis et professionnel."

    try:
        # SSL Verification active pour la sécurité
        res = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=15).json()
        content = res['candidates'][0]['content']['parts'][0]['text'] if 'candidates' in res else "Erreur génération IA."
        return Response({'content': content})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def admissions_list_api(request):
    if not hasattr(request.user, 'api_doctor'): 
        return Response({'error': 'Accès réservé aux médecins'}, status=403)
    
    doctor = request.user.api_doctor
    status_filter = request.query_params.get('status', 'all')
    search_query = request.query_params.get('search', '')
    
    query = Appointment.objects.filter(doctor=doctor).order_by('date')
    
    if status_filter != 'all':
        query = query.filter(status=status_filter)
        
    if search_query:
        query = query.filter(
            models.Q(patient__user__first_name__icontains=search_query) |
            models.Q(patient__user__last_name__icontains=search_query) |
            models.Q(reason__icontains=search_query)
        )

    return Response([{
        'id': a.id,
        'patientName': str(a.patient),
        'patientId': f"P-{a.patient.id}",
        'time': a.date.strftime('%H:%M'),
        'date': a.date.strftime('%d/%m/%Y'),
        'status': a.status,
        'reason': a.reason,
        'phone': a.patient.phone
    } for a in query])

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_admission_api(request):
    if not hasattr(request.user, 'api_doctor'): return Response(status=403)
    data = request.data
    user = User.objects.create_user(username=data.get('name').lower().replace(' ','_')+str(timezone.now().timestamp())[:4], password="TempPassword123!", role='patient')
    patient = Patient.objects.create(user=user, phone=data.get('phone'))
    Appointment.objects.create(patient=patient, doctor=request.user.api_doctor, date=timezone.now(), reason=data.get('reason'))
    return Response(status=201)

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def chat_sessions_list_api(request):
    user = request.user
    is_doctor = hasattr(user, 'api_doctor')
    
    patient = None
    if not is_doctor:
        patient = getattr(user, 'api_patient', None)
        if not patient:
            patient = Patient.objects.create(user=user)
    else:
        p_id = request.query_params.get('patient_id') or request.data.get('patient_id')
        if p_id:
            patient = get_object_or_404(Patient, id=str(p_id).replace('P-', ''))
        else:
            patient, _ = Patient.objects.get_or_create(user=user)

    if request.method == 'GET':
        query = request.query_params.get('search', '')
        sessions = ChatSession.objects.filter(patient=patient).order_by('-started_at')
        if query:
            sessions = sessions.filter(title__icontains=query)
            
        return Response([{
            'id': s.id,
            'title': s.title,
            'started_at': s.started_at,
            'message_count': s.messages.count()
        } for s in sessions])

    if request.method == 'POST':
        title = request.data.get('title', 'Nouvelle conversation')
        session = ChatSession.objects.create(patient=patient, title=title)
        
        user_name = f"{user.first_name} {user.last_name}".strip() or user.username
        role_label = "Docteur" if is_doctor else "Patient"
        welcome_text = f"Bonjour {role_label} {user_name}, je suis votre assistant IA. Comment puis-je vous aider ?"
        ChatMessage.objects.create(session=session, sender='assistant', content=welcome_text)
        
        return Response({
            'id': session.id,
            'title': session.title,
            'started_at': session.started_at
        }, status=201)

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def ai_assistant_view(request):
    """Interface de discussion avec l'IA Gemini (Sécurisé)."""
    user = request.user
    user_name = f"{user.first_name} {user.last_name}".strip() or user.username
    
    doctor_profile = getattr(user, 'api_doctor', None)
    patient_profile = getattr(user, 'api_patient', None)
    
    if not doctor_profile and not patient_profile:
        if user.role == 'doctor' or user.is_staff:
            doctor_profile = Doctor.objects.create(user=user)
        else:
            patient_profile = Patient.objects.create(user=user)

    is_doctor = doctor_profile is not None
    role_label = "Docteur" if is_doctor else "Patient"

    session_id = request.query_params.get('session_id') or (request.data.get('session_id') if request.method == 'POST' else None)
    
    if session_id:
        session = get_object_or_404(ChatSession, id=session_id)
        if not is_doctor and (patient_profile and session.patient != patient_profile):
            return Response({'error': 'Accès interdit'}, status=403)
        patient = session.patient
    else:
        if not is_doctor:
            patient = patient_profile
        else:
            p_id = request.query_params.get('patient_id') or (request.data.get('patient_id') if request.method == 'POST' else None)
            if p_id:
                patient = get_object_or_404(Patient, id=str(p_id).replace('P-', ''))
            else:
                patient, _ = Patient.objects.get_or_create(user=user)

        session = ChatSession.objects.filter(patient=patient).order_by('-started_at').first()
        if not session:
            session = ChatSession.objects.create(patient=patient, title="Discussion avec l'IA")
            welcome_text = f"Bonjour {role_label} {user_name}, je suis votre assistant IA. Comment puis-je vous aider ?"
            ChatMessage.objects.create(session=session, sender='assistant', content=welcome_text)

    if request.method == 'GET':
        messages = session.messages.all().order_by('timestamp')
        return Response({
            'session_id': session.id,
            'session_title': session.title,
            'role': role_label,
            'user_name': user_name,
            'history': [{'role': 'user' if m.sender=='patient' else 'assistant', 'content': m.content, 'time': m.timestamp.strftime('%H:%M')} for m in messages]
        })
    
    msg_content = request.data.get('message')
    if not msg_content:
        return Response({'error': 'Message vide'}, status=400)

    ChatMessage.objects.create(session=session, sender='patient', content=msg_content)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={settings.API_KEY}"
    context = f"Tu es l'assistant intelligent de la plateforme AfriHealth. Tu parles à {role_label} {user_name}."
    history_objs = session.messages.all().order_by('-timestamp')[:10][::-1]
    history_text = "\n".join([f"{'IA' if m.sender=='assistant' else 'Utilisateur'}: {m.content}" for m in history_objs])
    
    payload = {
        "contents": [{
            "parts": [{"text": f"{context}\n\n{history_text}\n\nIA:"}]
        }]
    }
    
    try:
        # SSL Verification active
        response = requests.post(url, json=payload, timeout=15)
        res = response.json()
        
        if 'candidates' in res and len(res['candidates']) > 0:
            reply = res['candidates'][0]['content']['parts'][0]['text']
        else:
            reply = "Désolé, l'assistant IA rencontre une difficulté technique."
            
        ChatMessage.objects.create(session=session, sender='assistant', content=reply)
        return Response({'reply': reply, 'session_id': session.id})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_chat_session_api(request, session_id):
    session = get_object_or_404(ChatSession, id=session_id)
    if not hasattr(request.user, 'api_doctor') and request.user.api_patient != session.patient:
        return Response({'error': 'Accès interdit'}, status=403)
    session.delete()
    return Response({'message': 'Session supprimée'}, status=204)

import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions, status
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)

# ... (keep existing code, find token_login_api)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@csrf_exempt
def token_login_api(request):
    """Authentification sécurisée par Token. Le bypass 'demo' a été supprimé."""
    logger.info(f"DEBUG: token_login_api received data: {request.data}")
    username = request.data.get('username')
    password = request.data.get('password')
    role = request.data.get('role')

    if not username or not password:
        logger.warning(f"DEBUG: Missing credentials. Username: {username}, Password: {bool(password)}")
        return Response({'error': 'Veuillez fournir username et password'}, status=400)
        
    user = authenticate(request, username=username, password=password)
    if user:
        from rest_framework.authtoken.models import Token
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'role': user.role})
        
    return Response({'error': 'Identifiants invalides'}, status=401)

def login_view(request):
    if request.user.is_authenticated:
        return redirect('home')
    if request.method == 'POST':
        u = request.POST.get('username')
        p = request.POST.get('password')
        user = authenticate(request, username=u, password=p)
        if user is not None:
            login(request, user)
            messages.success(request, f"Ravi de vous revoir, {user.first_name} !")
            return redirect('home')
        else:
            messages.error(request, "Identifiants incorrects.")
    return render(request, 'login.html')

def logout_user(request):
    logout(request)
    messages.info(request, "Vous avez été déconnecté.")
    return redirect('login_page')

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_view(request):
    """Vue consolidée du tableau de bord (API)."""
    try:
        user = request.user
        doctor = getattr(user, 'api_doctor', None)
        patient = getattr(user, 'api_patient', None)
        
        if doctor:
            total_patients = Patient.objects.count()
            start_of_day = timezone.make_aware(timezone.datetime.combine(timezone.now().date(), timezone.datetime.min.time()))
            end_of_day = timezone.make_aware(timezone.datetime.combine(timezone.now().date(), timezone.datetime.max.time()))
            today_appointments = Appointment.objects.filter(doctor=doctor, date__range=(start_of_day, end_of_day)).order_by('date')
            
            appts_data = [{
                'id': a.id,
                'patient_name': f"{a.patient.user.first_name} {a.patient.user.last_name}",
                'patient_id': f"P-{a.patient.id}",
                'time': a.date.strftime('%H:%M'),
                'type': a.reason or "Consultation",
                'status': a.get_status_display()
            } for a in today_appointments]

            return Response({
                'role': 'doctor',
                'stats': [
                    {'label': "Mes Patients", 'value': str(total_patients), 'icon': 'Users', 'color': 'primary'},
                    {'label': "RDV Aujourd'hui", 'value': str(today_appointments.count()), 'icon': 'Calendar', 'color': 'secondary'},
                ],
                'today_patients': appts_data
            })
            
        elif patient:
            my_appointments = Appointment.objects.filter(patient=patient).order_by('-date')
            return Response({
                'role': 'patient',
                'today_patients': [{
                    'id': a.id,
                    'patient_name': f"Dr. {a.doctor.user.last_name}",
                    'time': a.date.strftime('%H:%M'),
                    'date': a.date.strftime('%d/%m/%Y'),
                    'type': a.reason,
                    'status': a.status
                } for a in my_appointments]
            })
            
        return Response({'role': 'user', 'message': "Profil non trouvé"}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_patients_api(request):
    if not hasattr(request.user, 'api_doctor'):
        return Response({'error': 'Accès réservé au personnel médical.'}, status=403)
    
    query = request.query_params.get('search', '')
    patients = Patient.objects.all()
    
    if query:
        patients = patients.filter(
            models.Q(user__first_name__icontains=query) | 
            models.Q(user__last_name__icontains=query) | 
            models.Q(id__icontains=query.replace('P-', ''))
        )
    
    data = [{
        'id': f"P-{p.id}",
        'name': f"{p.user.first_name} {p.user.last_name}",
        'phone': p.phone,
        'username': p.user.username
    } for p in patients]
    
    return Response(data)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_profile_api(request):
    user = request.user
    data = request.data
    
    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.save()
    
    if hasattr(user, 'api_doctor'):
        profile = user.api_doctor
        profile.phone = data.get('phone', profile.phone)
        profile.specialty = data.get('specialty', profile.specialty)
        profile.save()
    elif hasattr(user, 'api_patient'):
        profile = user.api_patient
        profile.phone = data.get('phone', profile.phone)
        profile.save()
        
    return Response({'message': 'Profil mis à jour avec succès'})
