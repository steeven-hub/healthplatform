from rest_framework import viewsets
from .models import Consultation
from .serializers import ConsultationSerializer


class ConsultationViewSet(viewsets.ModelViewSet):
    queryset = Consultation.objects.all()
    serializer_class = ConsultationSerializer