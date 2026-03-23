from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Appointment
from .forms import AppointmentForm

# Liste des rendez-vous
@login_required
def appointment_list(request):
    user = request.user
    if hasattr(user, 'doctor'):
        appointments = Appointment.objects.filter(doctor=user)
    elif hasattr(user, 'patient'):
        appointments = Appointment.objects.filter(patient=user)
    else:
        appointments = Appointment.objects.none()
    return render(request, 'appointments/appointment_list.html', {'appointments': appointments})

# Réserver un rendez-vous
@login_required
def book_appointment(request):
    if request.method == 'POST':
        form = AppointmentForm(request.POST)
        if form.is_valid():
            appointment = form.save(commit=False)
            appointment.patient = request.user
            appointment.save()
            messages.success(request, "Rendez-vous réservé avec succès !")
            return redirect('appointment_list')
    else:
        form = AppointmentForm()
    return render(request, 'appointments/book_appointment.html', {'form': form})

# Créer un rendez-vous (optionnel)
@login_required
def create_appointment(request):
    return book_appointment(request)

# Modifier un rendez-vous
@login_required
def edit_appointment(request, appointment_id):
    appointment = get_object_or_404(Appointment, id=appointment_id)
    if request.method == 'POST':
        form = AppointmentForm(request.POST, instance=appointment)
        if form.is_valid():
            form.save()
            messages.success(request, "Rendez-vous modifié avec succès !")
            return redirect('appointment_list')
    else:
        form = AppointmentForm(instance=appointment)
    return render(request, 'appointments/edit_appointment.html', {'form': form})

# Supprimer un rendez-vous
@login_required
def delete_appointment(request, appointment_id):
    appointment = get_object_or_404(Appointment, id=appointment_id)
    appointment.delete()
    messages.success(request, "Rendez-vous supprimé.")
    return redirect('appointment_list')

# Détail d’un rendez-vous
@login_required
def appointment_detail(request, appointment_id):
    appointment = get_object_or_404(Appointment, id=appointment_id)
    return render(request, 'appointments/appointment_detail.html', {'appointment': appointment})