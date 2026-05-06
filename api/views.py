import os
import requests
import urllib3
import json
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Patient, Doctor, Appointment, Consultation, MedicalRecord, ChatSession, ChatMessage, ApiRecord, DoctorAvailability, Notification
from .serializers import *

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
User = get_user_model()

@api_view(['POST', 'GET'])
@permission_classes([permissions.AllowAny])
@csrf_exempt
def register_view(request):
    if request.method == 'POST':
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response({'message': "Compte créé !"}, status=201)
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
def dashboard_stats_api(request):
    try:
        today = timezone.now().date()
        user = request.user
        
        # Sécurité : vérifier les profils via getattr pour éviter les AttributeError
        doctor = getattr(user, 'api_doctor', None)
        patient = getattr(user, 'api_patient', None)
        
        if doctor:
            total_patients = Patient.objects.count()
            # Utiliser une plage de dates au lieu de __date pour plus de robustesse sur SQLite
            start_of_day = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.min.time()))
            end_of_day = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.max.time()))
            
            today_appointments = Appointment.objects.filter(doctor=doctor, date__range=(start_of_day, end_of_day)).order_by('date')
            
            appts_data = []
            for appt in today_appointments:
                try:
                    p_name = f"{appt.patient.user.first_name} {appt.patient.user.last_name}"
                    appts_data.append({
                        'id': appt.id,
                        'patient_name': p_name.strip() or appt.patient.user.username,
                        'patient_id': f"P-{appt.patient.id}",
                        'time': appt.date.strftime('%H:%M'),
                        'type': (appt.reason or "Consultation")[:30],
                        'status': appt.get_status_display()
                    })
                except: continue

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
            # RDV à venir
            my_appointments = Appointment.objects.filter(patient=patient, date__gte=timezone.now()).order_by('date')
            appts_data = []
            for a in my_appointments:
                try:
                    appts_data.append({
                        'id': a.id,
                        'doctor_name': f"Dr. {a.doctor.user.last_name}",
                        'time': a.date.strftime('%H:%M'),
                        'date': a.date.strftime('%d/%m/%Y'),
                        'reason': a.reason,
                        'status': a.status
                    })
                except: continue

            return Response({
                'role': 'patient',
                'stats': [
                    {'label': "Mes RDV", 'value': str(my_appointments.count()), 'icon': 'Calendar', 'color': 'primary'},
                    {'label': "Mon Groupe", 'value': getattr(patient, 'blood_group', 'N/A') or "N/A", 'icon': 'Activity', 'color': 'secondary'},
                ],
                'my_appointments': appts_data
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
        return Response({'error': str(e), 'trace': 'Erreur interne stats'}, status=500)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def patient_detail_api(request, patient_id):
    user = request.user
    if patient_id == 'my-profile':
        if not hasattr(user, 'api_patient'): 
            # Auto-réparation: Création du profil si c'est un patient
            if user.role == 'patient' or not hasattr(user, 'api_doctor'):
                patient = Patient.objects.create(user=user)
            else:
                return Response({'error': 'Ce compte n\'est pas lié à un profil patient.'}, status=403)
        else:
            patient = user.api_patient
    else:
        patient = get_object_or_404(Patient, id=str(patient_id).replace('P-', ''))
        # Permission: Médecin, Superuser, ou le Patient lui-même
        is_authorized = (
            user.is_superuser or 
            hasattr(user, 'api_doctor') or 
            (hasattr(user, 'api_patient') and user.api_patient.id == patient.id)
        )
        if not is_authorized:
            return Response({'error': 'Accès interdit'}, status=403)
    
    records = MedicalRecord.objects.filter(patient=patient).order_by('-created_at')
    return Response({
        'id': f"P-{patient.id}",
        'name': f"{patient.user.first_name} {patient.user.last_name}",
        'bloodGroup': getattr(patient, 'blood_group', 'N/A') or 'N/A',
        'phone': getattr(patient, 'phone', 'N/A') or 'N/A',
        'age': 45, 'gender': 'M', 'address': 'Abidjan',
        'photo': f"https://api.dicebear.com/7.x/avataaars/svg?seed={patient.user.username}",
        'allergies': [], 'chronicConditions': [],
        'history': [{'date': r.created_at.date(), 'doctor': str(r.doctor), 'diagnosis': r.diagnosis, 'prescription': r.prescription.split('\n') if r.prescription else [], 'vitals': {'bp':'N/A','hr':'N/A','temp':'N/A','weight':'N/A'}} for r in records],
        'consultations': []
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
    doctors = Doctor.objects.all()
    return Response([{'id': d.id, 'name': str(d), 'specialty': d.specialty, 'photo': f"https://api.dicebear.com/7.x/avataaars/svg?seed={d.user.username}"} for d in doctors])
@api_view(['POST', 'GET'])
@permission_classes([permissions.IsAuthenticated])
def book_appointment_api(request):
    """ Patient réserve un créneau ou consulte ses RDV """
    user = request.user
    if not hasattr(user, 'api_patient'):
        # Création auto si besoin
        patient = Patient.objects.create(user=user)
    else:
        patient = user.api_patient

    if request.method == 'GET':
        # Lister les rendez-vous du patient
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

    # POST: Réservation
    data = request.data
    availability_id = data.get('availability_id')
    avail = get_object_or_404(DoctorAvailability, id=availability_id, is_booked=False)

    # Créer le RDV (par défaut en attente 'pending')
    appointment = Appointment.objects.create(
        patient=patient,
        doctor=avail.doctor,
        date=timezone.now(), # Idéalement utiliser la date de la disponibilité
        reason=data.get('reason', 'Consultation réservée en ligne'),
        status='pending'
    )

    avail.is_booked = True
    avail.save()

    return Response({
        'message': 'Rendez-vous réservé avec succès !',
        'appointment_id': appointment.id,
        'status': appointment.status
    }, status=201)


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_appointment_status_api(request, appointment_id):
    """ Médecin confirme ou annule un RDV """
    if not hasattr(request.user, 'api_doctor'):
        return Response({'error': 'Seul le médecin peut changer le statut'}, status=403)
    
    appointment = get_object_or_404(Appointment, id=appointment_id, doctor=request.user.api_doctor)
    new_status = request.data.get('status')
    
    if new_status not in dict(Appointment.STATUS_CHOICES):
        return Response({'error': 'Statut invalide'}, status=400)
    
    appointment.status = new_status
    appointment.save()

    # Création d'une notification pour le patient
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
    """ Gère les notifications de l'utilisateur """
    if request.method == 'GET':
        notifs = Notification.objects.filter(user=request.user).order_by('-created_at')[:20]
        return Response([{
            'id': n.id,
            'title': n.title,
            'message': n.message,
            'is_read': n.is_read,
            'created_at': n.created_at
        } for n in notifs])
    
    # POST: Marquer tout comme lu
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response(status=204)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_medical_report(request):
    """ Génère un compte-rendu ou une ordonnance via l'IA """
    if not hasattr(request.user, 'api_doctor'):
        return Response({'error': 'Accès réservé aux médecins'}, status=403)
    
    diagnosis = request.data.get('diagnosis')
    report_type = request.data.get('type', 'report') # 'report' or 'prescription'
    
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
        res = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=15, verify=False).json()
        content = res['candidates'][0]['content']['parts'][0]['text'] if 'candidates' in res else "Erreur génération IA."
        return Response({'content': content})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def admissions_list_api(request):
    """ Liste des admissions et RDV pour le médecin """
    if not hasattr(request.user, 'api_doctor'): 
        return Response({'error': 'Accès réservé aux médecins'}, status=403)
    
    doctor = request.user.api_doctor
    today = timezone.now().date()
    
    # Filtrer par statut si demandé
    status_filter = request.query_params.get('status', 'all')
    
    # Récupérer tous les RDV de ce médecin
    query = Appointment.objects.filter(doctor=doctor).order_by('date')
    
    if status_filter != 'all':
        query = query.filter(status=status_filter)

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
    """ Liste ou crée des sessions de chat pour le patient """
    user = request.user
    is_doctor = hasattr(user, 'api_doctor')
    
    # Déterminer le patient cible
    patient = None
    if not is_doctor:
        patient = getattr(user, 'api_patient', None)
        if not patient:
            patient = Patient.objects.create(user=user)
    else:
        # Pour un docteur, on cherche un patient_id ou on utilise son propre profil patient virtuel
        p_id = request.query_params.get('patient_id') or request.data.get('patient_id')
        if p_id:
            patient = get_object_or_404(Patient, id=str(p_id).replace('P-', ''))
        else:
            # Fallback: le docteur voit ses propres conversations (sessions liées à lui-même en tant que patient)
            patient, _ = Patient.objects.get_or_create(user=user)

    if request.method == 'GET':
        sessions = ChatSession.objects.filter(patient=patient).order_by('-started_at')
        return Response([{
            'id': s.id,
            'title': s.title,
            'started_at': s.started_at,
            'message_count': s.messages.count()
        } for s in sessions])

    if request.method == 'POST':
        title = request.data.get('title', 'Nouvelle conversation')
        session = ChatSession.objects.create(patient=patient, title=title)
        
        # Premier message de l'IA
        user_name = f"{user.first_name} {user.last_name}".strip() or user.username
        role_label = "Docteur" if is_doctor else "Patient"
        welcome_text = f"Bonjour {role_label} {user_name}, je suis votre assistant IA. Comment puis-je vous aider dans cette nouvelle conversation ?"
        ChatMessage.objects.create(session=session, sender='assistant', content=welcome_text)
        
        return Response({
            'id': session.id,
            'title': session.title,
            'started_at': session.started_at
        }, status=201)

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def ai_assistant_view(request):
    """ Chatbot intelligent avec auto-réparation des profils et gestion de session """
    
    user = request.user
    user_name = f"{user.first_name} {user.last_name}".strip() or user.username
    
    # 1. Identifier et réparer le profil si nécessaire
    doctor_profile = getattr(user, 'api_doctor', None)
    patient_profile = getattr(user, 'api_patient', None)
    
    # Si le profil est manquant mais que le rôle est défini, on le crée
    if not doctor_profile and not patient_profile:
        if user.role == 'doctor' or user.is_staff:
            doctor_profile = Doctor.objects.create(user=user)
        else:
            patient_profile = Patient.objects.create(user=user)

    is_doctor = doctor_profile is not None
    role_label = "Docteur" if is_doctor else "Patient"

    # 2. Déterminer la session
    session_id = request.query_params.get('session_id') or (request.data.get('session_id') if request.method == 'POST' else None)
    
    if session_id:
        session = get_object_or_404(ChatSession, id=session_id)
        # Vérification simple
        if not is_doctor and (patient_profile and session.patient != patient_profile):
            return Response({'error': 'Accès interdit'}, status=403)
        patient = session.patient
    else:
        # Recherche du patient pour la session
        if not is_doctor:
            patient = patient_profile
        else:
            # Pour un docteur, on cherche un patient_id ou on utilise un profil "Médecin-Patient" virtuel
            p_id = request.query_params.get('patient_id') or (request.data.get('patient_id') if request.method == 'POST' else None)
            if p_id:
                patient = get_object_or_404(Patient, id=str(p_id).replace('P-', ''))
            else:
                # Si le docteur veut juste parler à l'IA, on lui crée un profil patient "virtuel" lié
                patient, _ = Patient.objects.get_or_create(user=user)

        # Session la plus récente
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

    # Sauvegarde
    ChatMessage.objects.create(session=session, sender='patient', content=msg_content)

    if session.title in ["Discussion avec Wilson", "Discussion avec l'IA", "Discussion initiale"]:
        session.title = msg_content[:40] + ("..." if len(msg_content) > 40 else "")
        session.save()

    # 3. IA (Appel API Gemini 3 Flash Preview)
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
        response = requests.post(url, json=payload, timeout=15, verify=False)
        res = response.json()
        
        # Log détaillé en cas d'absence de candidats
        if 'candidates' in res and len(res['candidates']) > 0:
            reply = res['candidates'][0]['content']['parts'][0]['text']
        else:
            # Analyse de l'erreur renvoyée par Google
            error_msg = res.get('error', {}).get('message', 'Pas de message d\'erreur')
            block_reason = ""
            if 'promptFeedback' in res:
                block_reason = f" (Bloqué par sécurité: {res['promptFeedback'].get('blockReason', 'inconnu')})"
            
            print(f"DEBUG IA ERROR: {res}")
            reply = f"Désolé, l'assistant IA rencontre une difficulté : {error_msg}{block_reason}"
            
        ChatMessage.objects.create(session=session, sender='assistant', content=reply)
        return Response({'reply': reply, 'session_id': session.id})
    except Exception as e:
        return Response({'reply': f"L'assistant IA est indisponible (Erreur réseau/serveur) : {str(e)}"}, status=500)

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def notifications_api(request):
    """ Gère les notifications de l'utilisateur """
    if request.method == 'GET':
        notifs = Notification.objects.filter(user=request.user).order_by('-created_at')[:20]
        return Response([{
            'id': n.id,
            'title': n.title,
            'message': n.message,
            'is_read': n.is_read,
            'created_at': n.created_at
        } for n in notifs])
    
    # POST: Marquer tout comme lu
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response(status=204)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_medical_report(request):
    """ Génère un compte-rendu ou une ordonnance via l'IA """
    if not hasattr(request.user, 'api_doctor'):
        return Response({'error': 'Accès réservé aux médecins'}, status=403)
    
    diagnosis = request.data.get('diagnosis')
    report_type = request.data.get('type', 'report') # 'report' or 'prescription'
    
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
        res = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=15, verify=False).json()
        content = res['candidates'][0]['content']['parts'][0]['text'] if 'candidates' in res else "Erreur génération IA."
        return Response({'content': content})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_medical_report_old(request):
    return Response({'report': "Rapport généré"})

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_chat_session_api(request, session_id):
    """ Permet de supprimer une session de chat """
    session = get_object_or_404(ChatSession, id=session_id)
    
    is_doctor = hasattr(request.user, 'api_doctor')
    if not is_doctor and request.user.api_patient != session.patient:
        return Response({'error': 'Accès interdit'}, status=403)
        
    session.delete()
    return Response({'message': 'Session supprimée'}, status=204)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def token_login_api(request):
    """ Authentification avec support du mode Démo """
    username = request.data.get('username')
    password = request.data.get('password')
    role = request.data.get('role')

    # Mode Démo: On cherche un utilisateur existant avec ce rôle
    if role and not username:
        demo_user = User.objects.filter(role=role).first()
        if demo_user:
            from rest_framework.authtoken.models import Token
            token, _ = Token.objects.get_or_create(user=demo_user)
            return Response({'token': token.key, 'role': demo_user.role})
        return Response({'error': f'Aucun compte démo trouvé pour le rôle {role}'}, status=404)
    
    if not username or not password:
        return Response({'error': 'Veuillez fournir username et password'}, status=400)
        
    user = authenticate(request, username=username, password=password)
    if user:
        from rest_framework.authtoken.models import Token
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'role': user.role})
        
    return Response({'error': 'Identifiants invalides'}, status=400)

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
            messages.error(request, "Identifiants incorrects. Veuillez réessayer.")
    return render(request, 'login.html')

def logout_user(request):
    logout(request)
    messages.info(request, "Vous avez été déconnecté.")
    return redirect('login_page')

@login_required(login_url='/api/login/')
def dashboard_view(request):
    is_doctor = hasattr(request.user, 'doctor') or hasattr(request.user, 'api_doctor')
    is_patient = hasattr(request.user, 'patient') or hasattr(request.user, 'api_patient')
    context = {
        'is_doctor': is_doctor,
        'is_patient': is_patient,
        'total_patients': Patient.objects.count() if is_doctor else 0,
        'total_appointments': Appointment.objects.count() if is_doctor else Appointment.objects.filter(patient__user=request.user).count()
    }
    return render(request, 'api/home.html', context)

@login_required(login_url='/api/login/')
def patients_list_view(request):
    if not (hasattr(request.user, 'doctor') or hasattr(request.user, 'api_doctor')):
        messages.error(request, "Accès réservé au personnel médical.")
        return redirect('home')
    return render(request, 'api/patients_list.html', {'patients': Patient.objects.all()})
