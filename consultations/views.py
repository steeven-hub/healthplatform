import uuid
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Consultation
from .serializers import ConsultationSerializer
from appointments.models import Appointment


from .medical_ai_service import MedicalAIService

class ConsultationViewSet(viewsets.ModelViewSet):
    queryset = Consultation.objects.all()
    serializer_class = ConsultationSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def test_ai(self, request):
        ai_service = MedicalAIService()
        result = ai_service.analyze_symptoms("Maux de tête", "Aucun antécédent")
        return Response(result)

    @action(detail=True, methods=['get'])
    def get_video_room(self, request, pk=None):
        consultation = self.get_object()
        
        # LOG DE DÉBOGAGE
        print(f"DEBUG: Req User: {request.user}, Patient: {consultation.patient}, Doctor: {consultation.doctor}")
        
        # Sécurité : Vérifier que l'utilisateur est bien le patient ou le docteur
        if request.user != consultation.patient and request.user != consultation.doctor:
            return Response({"error": f"Non autorisé. Vous êtes {request.user}, patient={consultation.patient}, doc={consultation.doctor}"}, status=status.HTTP_403_FORBIDDEN)
        
        # Générer un ID de salle s'il n'existe pas
        if not consultation.video_room_id:
            consultation.video_room_id = str(uuid.uuid4())
            consultation.save()
            
        return Response({"video_room_id": consultation.video_room_id})

@login_required
def consultation_list(request):
    if hasattr(request.user, 'doctor'):
        consultations = Consultation.objects.filter(doctor=request.user)
    else:
        consultations = Consultation.objects.filter(patient=request.user)
    return render(request, 'consultations/consultation_list.html', {'consultations': consultations})

@login_required
def create_consultation(request):
    # Logique simplifiée pour créer une consultation à partir d'un RDV
    if request.method == 'POST':
        appointment_id = request.POST.get('appointment_id')
        appointment = get_object_or_404(Appointment, id=appointment_id)
        consultation = Consultation.objects.create(
            appointment=appointment,
            patient=appointment.patient.user,
            doctor=appointment.doctor.user,
            diagnosis="En attente...",
        )
        return redirect('video_room', consultation_id=consultation.id)
    return redirect('appointment_list')

@login_required
def video_room(request, consultation_id):
    consultation = get_object_or_404(Consultation, id=consultation_id)
    
    # Vérification de sécurité
    if request.user != consultation.patient and request.user != consultation.doctor:
        return HttpResponse("Accès refusé", status=403)
        
    if not consultation.video_room_id:
        consultation.video_room_id = str(uuid.uuid4())
        consultation.save()
        
    return render(request, 'consultations/video_room.html', {
        'consultation': consultation,
        'room_name': consultation.video_room_id,
        'user_display_name': request.user.get_full_name() or request.user.username
    })