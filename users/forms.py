from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User

# -----------------------------
# Inscription Patient
# -----------------------------
class PatientRegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'phone_number', 'password1', 'password2']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.is_staff = False  # Les patients ne sont pas staff
        user.is_superuser = False
        if commit:
            user.save()
        return user

# -----------------------------
# Inscription Docteur
# -----------------------------
class DoctorRegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'phone_number', 'password1', 'password2']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.is_staff = True  # Les docteurs peuvent accéder à admin si besoin
        user.is_superuser = False
        if commit:
            user.save()
        return user

# -----------------------------
# Formulaire de Connexion
# -----------------------------
class LoginForm(forms.Form):
    username = forms.CharField(max_length=150, widget=forms.TextInput(attrs={'placeholder': 'Nom d’utilisateur'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Mot de passe'}))