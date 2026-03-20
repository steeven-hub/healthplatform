from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import PatientRegistrationForm, DoctorRegistrationForm, LoginForm
from patients.models import Patient
from doctors.models import Doctor

# -----------------------------
# Inscription Patient
# -----------------------------
def register_patient(request):
    if request.method == 'POST':
        form = PatientRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_staff = False
            user.is_superuser = False
            user.save()
            Patient.objects.create(user=user)
            messages.success(request, "Compte patient créé avec succès !")
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, "Veuillez corriger les erreurs dans le formulaire.")
    else:
        form = PatientRegistrationForm()
    return render(request, 'users/register_patient.html', {'form': form})


# -----------------------------
# Inscription Docteur
# -----------------------------
def register_doctor(request):
    SECRET_CODE = "TON_CODE_SECRET"  # Remplace par ton code secret réel
    if request.method == 'POST':
        form = DoctorRegistrationForm(request.POST)
        if form.is_valid():
            # Vérification du code secret
            if form.cleaned_data.get('secret_code') != SECRET_CODE:
                messages.error(request, "Code secret invalide pour s’inscrire comme docteur.")
                return render(request, 'users/register_doctor.html', {'form': form})

            user = form.save(commit=False)
            user.is_staff = True  # Docteurs peuvent accéder à admin si nécessaire
            user.is_superuser = False
            user.save()

            # Création du profil docteur
            Doctor.objects.create(user=user, specialty=form.cleaned_data['specialty'])
            messages.success(request, "Compte docteur créé avec succès !")
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, "Veuillez corriger les erreurs dans le formulaire.")
    else:
        form = DoctorRegistrationForm()
    return render(request, 'users/register_doctor.html', {'form': form})


# -----------------------------
# Connexion
# -----------------------------
def user_login(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user:
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