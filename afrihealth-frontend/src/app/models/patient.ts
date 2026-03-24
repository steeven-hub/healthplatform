export interface Patient {
  id: number;
  nom: string;
  prenom: string;
  age: number;
  groupeSanguin: string;
  derniereConsultation: string;
  constantes: {
    tension: string;
    poids: number;
    temperature: number;
  };
}