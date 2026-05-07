import uuid
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Consultation
from .serializers import ConsultationSerializer


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