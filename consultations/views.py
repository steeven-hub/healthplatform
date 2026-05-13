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

    def list(self, request, *args, **kwargs):
        print(f"DEBUG: User making list request: {request.user}") # Log the user making the list request
        queryset = self.filter_queryset(self.get_queryset())
        print(f"DEBUG: Available consultations queryset for list: {list(queryset.values_list('id', flat=True))}") # Log the queryset result
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def test_ai(self, request):
        ai_service = MedicalAIService()
        result = ai_service.analyze_symptoms("Maux de tête", "Aucun antécédent")
        return Response(result)

    @action(detail=True, methods=['get'])
    def get_video_room(self, request, pk=None):
        print(f"DEBUG: User making request: {request.user}") # Log the user making the request
        
        # Log the queryset before fetching the object
        current_consultations = Consultation.objects.all()
        print(f"DEBUG: Available consultations queryset (before get_object): {list(current_consultations.values_list('id', flat=True))}")
        
        consultation = self.get_object() # This uses get_object_or_404 based on pk and queryset
        
        # LOG DE DÉBOGAGE
        print(f"DEBUG: User making request: {request.user}") # Log the authenticated user
        print(f"DEBUG: Patient associated with consultation: {consultation.patient}") # Log the patient object
        print(f"DEBUG: Doctor associated with consultation: {consultation.doctor}") # Log the doctor object
        
        # Sécurité : Vérifier que l'utilisateur est bien le patient ou le docteur (comparaison par ID)
        if request.user.id != consultation.patient_id and request.user.id != consultation.doctor_id:
            return Response({"error": f"Accès refusé. User ID: {request.user.id}, Patient ID: {consultation.patient_id}, Doctor ID: {consultation.doctor_id}"}, status=status.HTTP_403_FORBIDDEN)
        
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
    
    # Vérification de sécurité (par ID)
    if request.user.id != consultation.patient.id and request.user.id != consultation.doctor.id:
        return HttpResponse("Accès refusé", status=403)
        
    if not consultation.video_room_id:
        consultation.video_room_id = str(uuid.uuid4())
        consultation.save()
        
    return render(request, 'consultations/video_room.html', {
        'consultation': consultation,
        'room_name': consultation.video_room_id,
        'user_display_name': request.user.get_full_name() or request.user.username
    })