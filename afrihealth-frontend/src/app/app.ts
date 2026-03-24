import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './components/chat/chat';
import { PatientRecordComponent } from './components/patient-record/patient-record';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ChatComponent, PatientRecordComponent],
  template: `
    <div class="d-flex" style="min-height: 100vh;">
      <nav class="bg-dark text-white p-3" style="width: 250px;" *ngIf="isLoggedIn">
        <h3 class="text-primary mb-4 text-center">AfriHealth</h3>
        <ul class="nav flex-column">
          <li class="nav-item mb-2">
            <a class="nav-link text-white d-flex align-items-center" (click)="setView('dashboard')" 
               style="cursor: pointer;" [class.text-primary]="currentView === 'dashboard'">
              <i class="bi bi-speedometer2 me-2"></i> Dashboard
            </a>
          </li>
          <li class="nav-item mb-2">
            <a class="nav-link text-white d-flex align-items-center" (click)="setView('patients')" 
               style="cursor: pointer;" [class.text-primary]="currentView === 'patients'">
              <i class="bi bi-person-badge me-2"></i> Patients
            </a>
          </li>
        </ul>
      </nav>

      <div class="flex-grow-1 bg-light">
        <header class="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
          <h4 class="m-0 text-secondary">
            {{ isLoggedIn ? 'Dr. SOGBOSSI - ' + (currentView === 'dashboard' ? 'Tableau de bord' : 'Patients') : 'Bienvenue sur AfriHealth' }}
          </h4>

          <div class="dropdown">
            <button *ngIf="isLoggedIn" (click)="toggleDropdown()" class="btn btn-light d-flex align-items-center border" type="button">
              <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px;">
                <i class="bi bi-person-fill"></i>
              </div>
              <span class="fw-bold">Mon Compte</span>
            </button>

            <button *ngIf="!isLoggedIn" (click)="login()" class="btn btn-primary">
              <i class="bi bi-box-arrow-in-right me-2"></i> Se connecter
            </button>

            <ul class="dropdown-menu dropdown-menu-end shadow border-0" [class.show]="showDropdown" 
                style="right: 0; left: auto; display: block;" *ngIf="showDropdown">
              <li><a class="dropdown-item py-2" (click)="setView('profile')" style="cursor:pointer"><i class="bi bi-person me-2"></i> Mon Profil</a></li>
              <li><a class="dropdown-item py-2" (click)="setView('settings')" style="cursor:pointer"><i class="bi bi-gear me-2"></i> Paramètres</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item py-2 text-danger" (click)="logout()" style="cursor:pointer"><i class="bi bi-box-arrow-right me-2"></i> Déconnexion</a></li>
            </ul>
          </div>
        </header>

        <div class="p-4">
          <div *ngIf="!isLoggedIn" class="text-center mt-5 p-5 bg-white rounded shadow-sm">
            <i class="bi bi-shield-lock text-primary" style="font-size: 3rem;"></i>
            <h3 class="mt-3">Veuillez vous connecter pour accéder au service AfriHealth.</h3>
          </div>

          <div *ngIf="isLoggedIn">
            <div *ngIf="currentView === 'dashboard'">
              <div class="row">
                <div class="col-md-4 mb-4">
                  <div class="card border-0 shadow-sm p-4 text-center bg-white">
                    <h6 class="text-muted text-uppercase small fw-bold">Consultations aujourd'hui</h6>
                    <h2 class="text-primary mb-0">12</h2>
                  </div>
                </div>
                <div class="col-md-8">
                  <app-chat></app-chat>
                </div>
              </div>
            </div>

            <div *ngIf="currentView === 'patients'">
               <app-patient-record></app-patient-record>
            </div>

            <div *ngIf="currentView === 'profile'" class="card p-4 border-0 shadow-sm">
               <h3 class="text-primary"><i class="bi bi-person-vcard me-2"></i>Profil du Docteur</h3>
               <hr>
               <p><strong>Nom :</strong> SOGBOSSI W. Bienvenu</p>
               <p><strong>Spécialité :</strong> Data Engineering & Software Development</p>
               <p><strong>Email :</strong> wilsonbienvenusogbossi&#64;gmail.com</p>
            </div>

            <div *ngIf="currentView === 'settings'" class="card p-4 border-0 shadow-sm">
               <h3 class="text-primary"><i class="bi bi-gear-wide-connected me-2"></i>Paramètres du site</h3>
               <hr>
               <p>Configuration du serveur Windows 10 et du backend Django.</p>
               <div class="form-check form-switch mt-3">
                 <input class="form-check-input" type="checkbox" id="flexSwitchCheckDefault" checked>
                 <label class="form-check-label" for="flexSwitchCheckDefault">Notifications en temps réel</label>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nav-link:hover { background: rgba(255,255,255,0.1); border-radius: 5px; }
    .nav-link { transition: all 0.3s ease; }
    .dropdown-menu { min-width: 200px; margin-top: 10px; }
    .card { border-radius: 12px; }
  `]
})
export class AppComponent {
  currentView: string = 'dashboard';
  isLoggedIn: boolean = true; 
  showDropdown: boolean = false;

  setView(view: string) {
    this.currentView = view;
    this.showDropdown = false; 
  }

  toggleDropdown() { 
    this.showDropdown = !this.showDropdown; 
  }

  login() { 
    this.isLoggedIn = true; 
  }

  logout() { 
    this.isLoggedIn = false; 
    this.showDropdown = false;
  }
}