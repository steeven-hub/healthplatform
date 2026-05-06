import { useParams } from "react-router";
import {
  User,
  Calendar,
  Phone,
  MapPin,
  AlertTriangle,
  Droplet,
  Activity,
  FileText,
  Pill,
  Stethoscope,
  TrendingUp
} from "lucide-react";

export function DMP() {
  const { patientId } = useParams();

  const patient = {
    id: patientId || "P-2401",
    name: "Koffi Adjoua",
    age: 45,
    gender: "Masculin",
    bloodGroup: "O+",
    phone: "+225 07 12 34 56 78",
    address: "Cocody, Abidjan, Côte d'Ivoire",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Koffi",
    allergies: ["Pénicilline", "Arachides"],
    chronicConditions: ["Hypertension", "Diabète Type 2"],
  };

  const consultations = [
    {
      date: "2026-05-01",
      time: "14:30",
      doctor: "Dr. Amani Kouadio",
      reason: "Suivi hypertension",
      diagnosis: "HTA contrôlée",
      prescription: ["Amlodipine 10mg - 1x/jour", "Ramipril 5mg - 1x/jour"],
      vitals: { bp: "135/85", hr: 78, temp: 36.8, weight: 82 }
    },
    {
      date: "2026-04-15",
      time: "10:00",
      doctor: "Dr. Koné Fatou",
      reason: "Bilan diabète",
      diagnosis: "Diabète équilibré",
      prescription: ["Metformine 850mg - 2x/jour"],
      vitals: { bp: "140/90", hr: 82, temp: 36.5, weight: 83 }
    },
    {
      date: "2026-03-20",
      time: "09:15",
      doctor: "Dr. Amani Kouadio",
      reason: "Consultation générale",
      diagnosis: "Ajustement traitement HTA",
      prescription: ["Amlodipine 5mg - 1x/jour"],
      vitals: { bp: "145/92", hr: 80, temp: 36.7, weight: 84 }
    },
  ];

  const labResults = [
    { test: "Glycémie à jeun", value: "5.8 mmol/L", range: "4.0-6.0", status: "normal", date: "2026-04-15" },
    { test: "HbA1c", value: "6.2%", range: "< 6.5%", status: "normal", date: "2026-04-15" },
    { test: "Créatinine", value: "95 µmol/L", range: "62-115", status: "normal", date: "2026-04-15" },
    { test: "Cholestérol total", value: "5.5 mmol/L", range: "< 5.2", status: "high", date: "2026-04-15" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start gap-6">
          <img
            src={patient.photo}
            alt={patient.name}
            className="w-24 h-24 rounded-full border-4 border-primary"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="flex items-center gap-3">
                  {patient.name}
                  <span className="px-3 py-1 bg-destructive text-destructive-foreground rounded-full text-sm">
                    {patient.bloodGroup}
                  </span>
                </h2>
                <p className="text-muted-foreground mt-1">{patient.id} • {patient.age} ans • {patient.gender}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{patient.address}</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Allergies</p>
                  <p className="text-sm text-destructive mt-1">{patient.allergies.join(", ")}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {patient.chronicConditions.map((condition) => (
                <span key={condition} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {condition}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              Historique des Consultations
            </h3>
            <div className="space-y-4">
              {consultations.map((consult, index) => (
                <div key={index} className="border-l-4 border-primary pl-4 pb-4 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{consult.reason}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(consult.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })} à {consult.time}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{consult.doctor}</span>
                  </div>

                  <div className="mt-3 p-3 bg-accent rounded-lg">
                    <p className="text-sm"><span className="font-medium">Diagnostic:</span> {consult.diagnosis}</p>
                    <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tension</p>
                        <p className="font-medium">{consult.vitals.bp} mmHg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">FC</p>
                        <p className="font-medium">{consult.vitals.hr} bpm</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Temp.</p>
                        <p className="font-medium">{consult.vitals.temp}°C</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Poids</p>
                        <p className="font-medium">{consult.vitals.weight} kg</p>
                      </div>
                    </div>
                  </div>

                  {consult.prescription.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Pill className="w-4 h-4 text-primary" />
                        Prescription
                      </p>
                      <ul className="mt-2 space-y-1">
                        {consult.prescription.map((med, i) => (
                          <li key={i} className="text-sm text-muted-foreground pl-6">• {med}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-secondary" />
              Constantes Vitales
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground">Tension Artérielle</p>
                <p className="mt-1">{consultations[0].vitals.bp} mmHg</p>
                <div className="mt-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-secondary">Amélioration</span>
                </div>
              </div>
              <div className="p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground">Fréquence Cardiaque</p>
                <p className="mt-1">{consultations[0].vitals.hr} bpm</p>
              </div>
              <div className="p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground">Poids</p>
                <p className="mt-1">{consultations[0].vitals.weight} kg</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="flex items-center gap-2 mb-4">
              <Stethoscope className="w-5 h-5 text-primary" />
              Résultats de Laboratoire
            </h3>
            <div className="space-y-3">
              {labResults.map((result, index) => (
                <div key={index} className="p-3 bg-accent rounded-lg">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium">{result.test}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      result.status === 'normal'
                        ? 'bg-secondary/10 text-secondary'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {result.status === 'normal' ? 'Normal' : 'Élevé'}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{result.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">Ref: {result.range}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
