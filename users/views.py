from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt  # <--- IMPORTÉ
from .forms import PatientRegistrationForm, DoctorRegistrationForm, LoginForm
from patients.models import Patient
from doctors.models import Doctor
from chat.models import ChatMessage

# -----------------------------
# Inscription Patient
# -----------------------------
@csrf_exempt  # <--- AJOUTÉ pour Postman
def register_patient(request):
    if request.method == 'POST':
        form = PatientRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.role = 'patient'
            user.is_approved = True
            user.is_staff = False
            user.is_superuser = False
            user.save()
            Patient.objects.create(user=user)
            messages.success(request, "Compte patient créé avec succès !")
            login(request, user)
            return redirect('home')
        else:
            # En cas d'erreur, on peut voir les erreurs dans le terminal
            print(form.errors) 
            messages.error(request, "Veuillez corriger les erreurs dans le formulaire.")
    else:
        form = PatientRegistrationForm()
    return render(request, 'users/register_patient.html', {'form': form})

# -----------------------------
# Inscription Docteur
# -----------------------------
@csrf_exempt  # <--- AJOUTÉ pour Postman
def register_doctor(request):
    if request.method == 'POST':
        form = DoctorRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.role = 'doctor'
            user.is_approved = False  # 🔥 en attente validation admin
            user.is_staff = True
            user.is_superuser = False
            user.save()
            Doctor.objects.create(
                user=user,
                specialty=form.cleaned_data.get('specialty')
            )
            messages.success(request, "Compte docteur créé. En attente de validation.")
            return redirect('login')
        else:
            print(form.errors)
            messages.error(request, "Veuillez corriger les erreurs dans le formulaire.")
    else:
        form = DoctorRegistrationForm()
    return render(request, 'users/register_doctor.html', {'form': form})

# -----------------------------
# Connexion
# -----------------------------
@csrf_exempt  # <--- AJOUTÉ pour Postman
def user_login(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user:
                if user.role == 'doctor' and not user.is_approved:
                    messages.error(request, "Votre compte médecin est en attente de validation.")
                    return redirect('login')
                login(request, user)
                return redirect('home')
            else:
                messages.error(request, "Identifiants invalides.")
    else:
        form = LoginForm()
    return render(request, 'users/login.html', {'form': form})

# -----------------------------
# Déconnexion
# -----------------------------
def user_logout(request):
    logout(request)
    messages.success(request, "Vous êtes déconnecté.")
    return redirect('login')

# -----------------------------
# Page d'accueil après login
# -----------------------------
@login_required
def home(request):
    user = request.user
    if hasattr(user, 'patient'):
        return render(request, 'users/home_patient.html', {'user': user})
    elif hasattr(user, 'doctor'):
        return render(request, 'users/home_doctor.html', {'user': user})
    else:
        return render(request, 'users/home.html', {'user': user})