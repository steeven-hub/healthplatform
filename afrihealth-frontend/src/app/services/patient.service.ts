import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient } from '../models/patient';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  // URL de ton API Django (à adapter selon tes réglages DRF)
  private apiUrl = 'http://localhost:8000/api/patients/';

  constructor(private http: HttpClient) { }

  // Récupérer la liste de tous les patients depuis la DB
  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.apiUrl);
  }

  // Récupérer un patient spécifique par son ID
  getPatientById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}${id}/`);
  }
}