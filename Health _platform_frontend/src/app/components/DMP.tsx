import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { jsPDF } from "jspdf";
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
  TrendingUp,
  Loader2,
  PlusCircle,
  Sparkles,
  Download
} from "lucide-react";
import api from "../api";
import { toast } from "sonner";

export function DMP() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newRecord, setNewRecord] = useState({ diagnosis: "", prescription: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const downloadPDF = (type: 'report' | 'prescription', content: string) => {
    if (!content) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(33, 150, 243);
    doc.text("AfriHealth Digital Platform", 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    const title = type === 'prescription' ? "ORDONNANCE MÉDICALE" : "COMPTE-RENDU MÉDICAL";
    doc.text(title, 105, 35, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);
    doc.setFontSize(12);
    doc.text(`Patient: ${patient.name}`, 20, 55);
    doc.text(`ID: ${patient.id}`, 20, 62);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 140, 55);
    doc.text(`Médecin: Dr. ${user?.last_name || 'Inconnu'}`, 20, 75);
    doc.setFontSize(14);
    doc.text(type === 'prescription' ? "Prescription:" : "Diagnostic & Observations:", 20, 95);
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(content, 170);
    doc.text(splitText, 20, 105);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Ce document a été généré électroniquement via AfriHealth IA.", 105, 280, { align: 'center' });
    doc.save(`${type}_${patient.name.replace(/\s+/g, '_')}.pdf`);
    toast.success("PDF téléchargé !");
  };

  const fetchPatientData = async () => {
    setIsLoading(true);
    try {
      const userRes = await api.get("/me/");
      setUser(userRes.data);

      let id = patientId;
      if (!id && userRes.data.role === 'patient') {
        const profileRes = await api.get("/patient-detail/my-profile/");
        id = profileRes.data.id;
      } else if (!id) {
        id = "1";
      }

      const response = await api.get(`/patient-detail/${id}/`);
      setPatient(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération du dossier:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const generateIA = async (type: 'report' | 'prescription') => {
    if (!newRecord.diagnosis) {
        toast.error("Veuillez d'abord saisir un diagnostic.");
        return;
    }
    setIsGenerating(type);
    try {
        const response = await api.post("/generate-report/", {
            diagnosis: newRecord.diagnosis,
            type: type
        });
        if (type === 'prescription') {
            setNewRecord({...newRecord, prescription: response.data.content});
        } else {
            setNewRecord({...newRecord, diagnosis: response.data.content});
        }
        toast.success("Généré avec succès par l'IA");
    } catch (e) {
        toast.error("Erreur lors de la génération IA");
    } finally {
        setIsGenerating(null);
    }
  };

  const handleAddRecord = async () => {
    if (!newRecord.diagnosis) return;
    setIsSubmitting(true);
    try {
      await api.post("/medical-records/create/", {
        patient_id: patient.id,
        diagnosis: newRecord.diagnosis,
        prescription: newRecord.prescription
      });
      setNewRecord({ diagnosis: "", prescription: "" });
      setShowAddRecord(false);
      fetchPatientData(); // Rafraîchir l'historique
    } catch (error) {
      console.error("Erreur lors de l'ajout du dossier:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Dossier patient introuvable.
      </div>
    );
  }

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
              {user?.role === 'doctor' && (
                <button 
                  onClick={() => setShowAddRecord(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <PlusCircle className="w-5 h-5" />
                  Nouvel Examen
                </button>
              )}
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
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {showAddRecord && (
            <div className="bg-card border-2 border-primary rounded-lg p-6 animate-in fade-in slide-in-from-top-4">
              <h3 className="mb-4">Nouvelle Entrée Médicale</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Diagnostic / Observations</label>
                    <div className="flex gap-2">
                        {newRecord.diagnosis && (
                            <button 
                                onClick={() => downloadPDF('report', newRecord.diagnosis)}
                                className="text-[10px] flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                            >
                                <Download className="w-3 h-3" /> PDF
                            </button>
                        )}
                        <button 
                            onClick={() => generateIA('report')}
                            disabled={isGenerating !== null}
                            className="text-[10px] flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary rounded hover:bg-secondary/20 transition-colors"
                        >
                            {isGenerating === 'report' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Aider avec l'IA
                        </button>
                    </div>
                  </div>
                  <textarea 
                    value={newRecord.diagnosis}
                    onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    placeholder="Saisissez le diagnostic..."
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Prescription (un médicament par ligne)</label>
                    <div className="flex gap-2">
                        {newRecord.prescription && (
                            <button 
                                onClick={() => downloadPDF('prescription', newRecord.prescription)}
                                className="text-[10px] flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                            >
                                <Download className="w-3 h-3" /> PDF
                            </button>
                        )}
                        <button 
                            onClick={() => generateIA('prescription')}
                            disabled={isGenerating !== null}
                            className="text-[10px] flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary rounded hover:bg-secondary/20 transition-colors"
                        >
                            {isGenerating === 'prescription' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Générer Ordonnance (IA)
                        </button>
                    </div>
                  </div>
                  <textarea 
                    value={newRecord.prescription}
                    onChange={(e) => setNewRecord({...newRecord, prescription: e.target.value})}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                    placeholder="Ex: Paracétamol 500mg - 3x/jour"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddRecord(false)}
                    className="px-6 py-2 bg-accent rounded-lg hover:bg-accent/80 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    disabled={isSubmitting || !newRecord.diagnosis}
                    onClick={handleAddRecord}
                    className="flex-1 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Enregistrer le Dossier
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              Historique Médical
            </h3>
            <div className="space-y-4">
              {patient.history && patient.history.length > 0 ? (
                patient.history.map((record: any, index: number) => (
                  <div key={index} className="border-l-4 border-primary pl-4 pb-4 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-lg">{record.diagnosis}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className="text-xs bg-accent px-2 py-1 rounded text-muted-foreground">{record.doctor}</span>
                    </div>

                    {record.prescription && record.prescription.length > 0 && record.prescription[0] !== "" && (
                      <div className="mt-3 p-4 bg-accent/50 rounded-lg border border-border">
                        <p className="text-sm font-bold flex items-center gap-2 mb-2 text-primary">
                          <Pill className="w-4 h-4" />
                          Prescription
                        </p>
                        <ul className="space-y-1">
                          {record.prescription.map((med: string, i: number) => (
                            <li key={i} className="text-sm text-foreground flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                              {med}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun antécédent médical enregistré.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-secondary" />
              État de Santé
            </h3>
            <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
              <p className="text-sm font-medium">Groupe Sanguin</p>
              <p className="text-2xl font-bold text-secondary mt-1">{patient.bloodGroup}</p>
            </div>
            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium">Dernière Visite</p>
              <p className="text-lg font-bold text-primary mt-1">
                {patient.history?.[0] ? new Date(patient.history[0].date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="flex items-center gap-2 mb-4">
              <Stethoscope className="w-5 h-5 text-primary" />
              Consultations Récentes
            </h3>
            <div className="space-y-3">
              {patient.consultations && patient.consultations.length > 0 ? (
                patient.consultations.map((consult: any, index: number) => (
                  <div key={index} className="p-3 bg-accent rounded-lg border border-border">
                    <p className="text-sm font-bold">{consult.reason || "Consultation"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(consult.date).toLocaleDateString()}</p>
                    <p className="text-sm mt-2 line-clamp-3 text-muted-foreground italic">"{consult.notes}"</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Aucune consultation récente.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
