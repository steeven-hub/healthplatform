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

  const downloadPDF = (type: 'report' | 'prescription', content: string, date?: string, doctorName?: string) => {
    if (!content) return;
    const doc = new jsPDF();
    const docDate = date || new Date().toLocaleDateString('fr-FR');
    const docDoctor = doctorName || `Dr. ${user?.last_name || 'Inconnu'}`;

    // --- Header ---
    doc.setFontSize(22);
    doc.setTextColor(33, 150, 243);
    doc.text("AfriHealth Digital Platform", 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Santé connectée pour tous", 105, 26, { align: 'center' });

    // --- Title ---
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    const title = type === 'prescription' ? "ORDONNANCE MÉDICALE" : "COMPTE-RENDU MÉDICAL";
    doc.text(title, 105, 45, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(33, 150, 243);
    doc.line(20, 50, 190, 50);

    // --- Info Box ---
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Patient: ${patient.name}`, 20, 65);
    doc.text(`ID Patient: ${patient.id}`, 20, 72);
    doc.text(`Groupe Sanguin: ${patient.bloodGroup}`, 20, 79);
    
    doc.text(`Date: ${docDate}`, 140, 65);
    doc.text(`Lieu: Abidjan, Côte d'Ivoire`, 140, 72);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Médecin traitant: ${docDoctor}`, 20, 95);
    doc.setFont("helvetica", "normal");

    // --- Content ---
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, 105, 170, 140); // Cadre pour le contenu
    
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.text(type === 'prescription' ? "PRESCRIPTION :" : "DIAGNOSTIC & OBSERVATIONS :", 25, 115);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const splitText = doc.splitTextToSize(content, 160);
    doc.text(splitText, 25, 125);

    // --- Footer ---
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Ce document est authentique et a été généré via la plateforme sécurisée AfriHealth.", 105, 265, { align: 'center' });
    doc.text("Contact: support@afrihealth.ci | www.afrihealth.ci", 105, 272, { align: 'center' });
    
    doc.save(`${type}_${patient.name.replace(/\s+/g, '_')}_${docDate.replace(/\//g, '-')}.pdf`);
    toast.success("Document PDF généré !");
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="relative">
            <img
              src={patient.photo}
              alt={patient.name}
              className="w-32 h-32 rounded-3xl object-cover border-4 border-background shadow-lg"
            />
            <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-2 rounded-xl shadow-md">
              <User className="w-6 h-6" />
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold flex items-center gap-3">
                  {patient.name}
                  <span className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-bold uppercase tracking-wider">
                    {patient.bloodGroup}
                  </span>
                </h2>
                <p className="text-muted-foreground mt-2 font-medium">{patient.id} • {patient.age} ans • {patient.gender}</p>
              </div>
              {user?.role === 'doctor' && (
                <button 
                  onClick={() => setShowAddRecord(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  <PlusCircle className="w-5 h-5" />
                  Nouvel Examen
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="flex items-center gap-3 bg-accent/30 p-4 rounded-2xl">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">{patient.phone}</span>
              </div>
              <div className="flex items-center gap-3 bg-accent/30 p-4 rounded-2xl">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">{patient.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {showAddRecord && (
            <div className="bg-card border-2 border-primary/20 rounded-3xl p-8 shadow-xl shadow-primary/5 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl"><PlusCircle className="w-5 h-5 text-primary" /></div>
                Nouvelle Entrée Médicale
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider">Diagnostic / Observations</label>
                    <div className="flex gap-2">
                        {newRecord.diagnosis && (
                            <button 
                                onClick={() => downloadPDF('report', newRecord.diagnosis)}
                                className="text-[10px] flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-all"
                            >
                                <Download className="w-3.5 h-3.5" /> PDF
                            </button>
                        )}
                        <button 
                            onClick={() => generateIA('report')}
                            disabled={isGenerating !== null}
                            className="text-[10px] flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 text-secondary rounded-lg font-bold hover:bg-secondary/20 transition-all"
                        >
                            {isGenerating === 'report' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                            IA
                        </button>
                    </div>
                  </div>
                  <textarea 
                    value={newRecord.diagnosis}
                    onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})}
                    className="w-full px-5 py-4 bg-accent/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                    rows={4}
                    placeholder="Saisissez le diagnostic..."
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider">Prescription</label>
                    <div className="flex gap-2">
                        {newRecord.prescription && (
                            <button 
                                onClick={() => downloadPDF('prescription', newRecord.prescription)}
                                className="text-[10px] flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-all"
                            >
                                <Download className="w-3.5 h-3.5" /> PDF
                            </button>
                        )}
                        <button 
                            onClick={() => generateIA('prescription')}
                            disabled={isGenerating !== null}
                            className="text-[10px] flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 text-secondary rounded-lg font-bold hover:bg-secondary/20 transition-all"
                        >
                            {isGenerating === 'prescription' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                            IA
                        </button>
                    </div>
                  </div>
                  <textarea 
                    value={newRecord.prescription}
                    onChange={(e) => setNewRecord({...newRecord, prescription: e.target.value})}
                    className="w-full px-5 py-4 bg-accent/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                    rows={4}
                    placeholder="Ex: Paracétamol 500mg - 3x/jour"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowAddRecord(false)}
                    className="px-8 py-3 bg-accent font-bold rounded-2xl hover:bg-accent/80 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    disabled={isSubmitting || !newRecord.diagnosis}
                    onClick={handleAddRecord}
                    className="flex-1 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                  >
                    {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    Enregistrer le Dossier
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
            <h3 className="flex items-center gap-3 mb-8 text-xl font-bold">
               <div className="p-2 bg-primary/10 rounded-xl"><FileText className="w-5 h-5 text-primary" /></div>
               Historique Médical
            </h3>
            <div className="space-y-8">
              {patient.history && patient.history.length > 0 ? (
                patient.history.map((record: any, index: number) => (
                  <div key={index} className="relative border-l-2 border-border pl-8">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-background border-2 border-primary rounded-full" />
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-4">
                          <p className="font-bold text-lg">{record.diagnosis}</p>
                          <button 
                            onClick={() => downloadPDF('report', record.diagnosis, new Date(record.date).toLocaleDateString('fr-FR'), record.doctor)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-primary rounded-lg font-bold hover:bg-primary hover:text-white transition-all text-[10px]"
                            title="Télécharger le compte-rendu"
                          >
                            <Download className="w-3.5 h-3.5" />
                            PDF Rapport
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-muted-foreground mt-1">
                          {new Date(record.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/50 px-3 py-1 rounded-full text-muted-foreground">{record.doctor}</span>
                    </div>

                    {record.prescription && record.prescription.length > 0 && record.prescription[0] !== "" && (
                      <div className="mt-4 p-6 bg-accent/30 rounded-2xl border border-border/50">
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-sm font-bold flex items-center gap-2 text-primary">
                            <Pill className="w-4 h-4" />
                            Prescription
                          </p>
                          <button 
                            onClick={() => downloadPDF('prescription', record.prescription.join('\n'), new Date(record.date).toLocaleDateString('fr-FR'), record.doctor)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary hover:text-white transition-all text-[10px]"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF
                          </button>
                        </div>
                        <ul className="space-y-2">
                          {record.prescription.map((med: string, i: number) => (
                            <li key={i} className="text-sm font-medium flex items-center gap-3">
                              <div className="w-2 h-2 bg-primary/50 rounded-full"></div>
                              {med}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm font-medium text-muted-foreground text-center py-12">Aucun antécédent médical enregistré.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
            <h3 className="flex items-center gap-3 mb-6 text-xl font-bold">
               <div className="p-2 bg-secondary/10 rounded-xl"><Activity className="w-5 h-5 text-secondary" /></div>
               État de Santé
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-secondary/5 border border-secondary/10 rounded-2xl">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Groupe Sanguin</p>
                  <p className="text-3xl font-extrabold text-secondary mt-2">{patient.bloodGroup}</p>
                </div>
                <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dernière Visite</p>
                  <p className="text-sm font-extrabold text-primary mt-2">
                    {patient.history?.[0] ? new Date(patient.history[0].date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
            <h3 className="flex items-center gap-3 mb-6 text-xl font-bold">
               <div className="p-2 bg-primary/10 rounded-xl"><Stethoscope className="w-5 h-5 text-primary" /></div>
               Consultations Récentes
            </h3>
            <div className="space-y-4">
              {patient.consultations && patient.consultations.length > 0 ? (
                patient.consultations.map((consult: any, index: number) => (
                <div key={index} className="p-5 bg-accent/30 rounded-2xl border border-border/50">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-bold">{consult.reason || "Consultation"}</p>
                        <a 
                            href={`/app/consultation/${consult.id}/video`}
                            target="_blank"
                            className="text-[10px] font-bold px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all"
                        >
                            Vidéo
                        </a>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground mt-1">{new Date(consult.date).toLocaleDateString()}</p>
                    <p className="text-sm mt-3 text-muted-foreground italic font-medium leading-relaxed">"{consult.notes}"</p>
                  </div>
                ))
              ) : (
                <p className="text-sm font-medium text-muted-foreground text-center py-10">Aucune consultation récente.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
