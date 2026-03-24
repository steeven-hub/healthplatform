import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Patient } from '../../models/patient';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-record',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-0">
      <div *ngIf="loading" class="text-center p-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-muted">Récupération des dossiers (Bénin)...</p>
      </div>

      <div class="row" *ngIf="!loading">
        
        <div class="col-md-4">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
              <span>Mes Patients</span>
              <span class="badge bg-primary" *ngIf="patients">{{patients.length}}</span>
            </div>
            
            <div class="list-group list-group-flush" style="max-height: 500px; overflow-y: auto;">
              <div *ngIf="patients.length === 0" class="p-4 text-center text-muted">
                Aucun patient trouvé.
              </div>

              <button *ngFor="let p of patients" 
                      (click)="selectPatient(p)"
                      [class.active]="selectedPatient?.id === p.id"
                      class="list-group-item list-group-item-action p-3">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-1 fw-bold">{{p.nom}} {{p.prenom}}</h6>
                  <span class="badge rounded-pill bg-light text-dark border small">{{p.groupeSanguin}}</span>
                </div>
                <small class="text-muted">Dernier RDV: {{p.derniereConsultation}}</small>
              </button>
            </div>
          </div>
        </div>

        <div class="col-md-8" *ngIf="selectedPatient">
          <div class="card shadow-sm border-0">
            <div class="card-body">
              <div class="d-flex align-items-center mb-4">
                <div class="bg-primary text-white rSounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 55px; height: 55px; font-size: 1.2rem;">
                  {{selectedPatient?.nom?.[0]}}
                </div>
                <div class="ms-3">
                  <h4 class="mb-0 fw-bold">{{selectedPatient.nom}} {{selectedPatient.prenom}}</h4>
                  <p class="text-muted mb-0">{{selectedPatient.age}} ans • ID #00{{selectedPatient.id}}</p>
                </div>
              </div>

              <ul class="nav nav-pills mb-3 bg-light p-1 rounded">
                <li class="nav-item flex-fill">
                  <a class="nav-link text-center" [class.active]="activeTab === 'histo'" (click)="activeTab = 'histo'" style="cursor:pointer">Historique</a>
                </li>
                <li class="nav-item flex-fill">
                  <a class="nav-link text-center" [class.active]="activeTab === 'ordo'" (click)="activeTab = 'ordo'" style="cursor:pointer">Ordonnances</a>
                </li>
                <li class="nav-item flex-fill">
                  <a class="nav-link text-center" [class.active]="activeTab === 'exam'" (click)="activeTab = 'exam'" style="cursor:pointer">Examens</a>
                </li>
              </ul>
              
              <div [ngSwitch]="activeTab" class="mt-4">
                <div *ngSwitchCase="'histo'" class="fade-in">
                  <div class="row text-center mb-4" *ngIf="selectedPatient.constantes">
                    <div class="col-4">
                      <div class="p-3 border-0 rounded shadow-sm bg-white">
                        <small class="text-muted d-block mb-1">Tension</small>
                        <strong class="text-danger fs-5">{{selectedPatient.constantes.tension}}</strong>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="p-3 border-0 rounded shadow-sm bg-white">
                        <small class="text-muted d-block mb-1">Poids</small>
                        <strong class="text-dark fs-5">{{selectedPatient.constantes.poids}}kg</strong>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="p-3 border-0 rounded shadow-sm bg-white">
                        <small class="text-muted d-block mb-1">Température</small>
                        <strong class="text-warning fs-5">{{selectedPatient.constantes.temperature}}°C</strong>
                      </div>
                    </div>
                  </div>
                  <div class="alert alert-light border-start border-primary border-4 shadow-sm">
                    <i class="bi bi-info-circle me-2"></i>
                    <strong>Note du Dr. SOGBOSSI :</strong> Dossier médical à jour.
                  </div>
                </div>

                <div *ngSwitchCase="'ordo'">
                  <div class="list-group shadow-sm">
                    <div class="list-group-item">Aucune ordonnance récente.</div>
                  </div>
                  <button class="btn btn-primary btn-sm mt-4 w-100 rounded-pill">Nouvelle Ordonnance</button>
                </div>

                <div *ngSwitchCase="'exam'">
                  <div class="table-responsive">
                    <table class="table table-hover border-0 shadow-sm bg-white rounded overflow-hidden">
                      <thead class="table-primary text-white">
                        <tr><th>Examen</th><th>Date</th><th>Statut</th></tr>
                      </thead>
                      <tbody>
                        <tr><td colspan="3" class="text-center text-muted">Aucun examen enregistré.</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nav-pills .nav-link.active { background-color: #0d6efd; box-shadow: 0 4px 6px rgba(13, 110, 253, 0.2); }
    .list-group-item.active { background-color: #f8f9fa; border-left: 4px solid #0d6efd !important; color: #0d6efd; }
    .fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class PatientRecordComponent implements OnInit {
  activeTab: string = 'histo';
  patients: Patient[] = [];
  selectedPatient: Patient | null = null;
  loading: boolean = true;

  constructor(private patientService: PatientService) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.loading = true;
    this.patientService.getPatients().subscribe({
      next: (data: any) => {
        /** * RÉSOLUTION NG02200 : 
         * Si Django REST Framework a la pagination activée, la liste est dans data.results.
         * Sinon, c'est data lui-même.
         */
        this.patients = Array.isArray(data) ? data : (data.results || []);
        
        if (this.patients.length > 0) {
          this.selectedPatient = this.patients[0];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur API Django:', err);
        this.loading = false;
        this.patients = [];
      }
    });
  }

  selectPatient(p: Patient) { 
    this.selectedPatient = p; 
    this.activeTab = 'histo';
  }
}