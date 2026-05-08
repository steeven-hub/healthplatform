from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets
from .models import MedicalRecord
from .serializers import MedicalRecordSerializer
from patients.models import Patient

class MedicalRecordViewSet(viewsets.ModelViewSet):
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer

@login_required
def medical_record_list(request):
    if hasattr(request.user, 'api_doctor'):
        # For doctors, maybe show records they created or all records they have access to
        records = MedicalRecord.objects.filter(doctor=request.user.api_doctor)
    elif hasattr(request.user, 'api_patient'):
        records = MedicalRecord.objects.filter(patient=request.user.api_patient)
    else:
        records = MedicalRecord.objects.none()
    return render(request, 'medicalrecords/record_list.html', {'records': records})

@login_required
def patient_medical_record(request, patient_id):
    patient = get_object_or_404(Patient, id=patient_id)
    # Security check: only the patient or a doctor should see this
    if request.user.role == 'patient' and request.user.api_patient.id != patient_id:
        return render(request, '403.html', status=403)
    
    records = MedicalRecord.objects.filter(patient=patient)
    return render(request, 'medicalrecords/record_list.html', {'records': records, 'patient': patient})