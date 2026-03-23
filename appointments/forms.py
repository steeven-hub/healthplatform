from django import forms
from .models import Appointment
from django.contrib.auth import get_user_model

User = get_user_model()

class AppointmentForm(forms.ModelForm):
    class Meta:
        model = Appointment
        fields = ['doctor', 'date']  # patient sera ajouté automatiquement dans la vue
        widgets = {
            'date': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        }

    # 🔹 Filtrer uniquement les docteurs dans la liste
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['doctor'].queryset = User.objects.filter(role='doctor', is_approved=True)