import { useEffect, useState } from "react";
import { Users, AlertCircle, Calendar, Activity, TrendingUp, TrendingDown, Loader2, Clock, CheckCircle, FileText, Download } from "lucide-react";
import { Link } from "react-router";
import api from "../api";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function Dashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const downloadPDF = (record: any) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(33, 150, 243);
    doc.text("AfriHealth Digital Platform", 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("ORDONNANCE / COMPTE-RENDU", 105, 40, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);

    doc.setFontSize(12);
    doc.text(`Date: ${record.date}`, 20, 60);
    doc.text(`Médecin: ${record.doctor}`, 20, 67);
    
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.text("Diagnostic:", 20, 85);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(doc.splitTextToSize(record.diagnosis, 170), 20, 92);

    if (record.prescription && record.prescription.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(33, 150, 243);
        doc.text("Prescription:", 20, 120);
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(record.prescription.join('\n'), 20, 127);
    }

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Document authentifié AfriHealth", 105, 280, { align: 'center' });
    
    doc.save(`document_medical_${record.date.replace(/\//g, '-')}.pdf`);
    toast.success("Document téléchargé !");
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/stats/");
        setData(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users': return Users;
      case 'Calendar': return Calendar;
      case 'Activity': return Activity;
      case 'TrendingUp': return TrendingUp;
      default: return Activity;
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Health Pulse */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            {data?.role === 'doctor' ? t('dashboard_doctor') : t('dashboard_patient')}
          </h2>
          <p className="text-muted-foreground mt-1">{t('welcome_message')}</p>
        </div>
        {data?.role !== 'doctor' && (
          <div className="bg-card border border-border/50 p-4 rounded-2xl shadow-sm flex items-center gap-4 w-full md:w-auto">
             <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Santé Pulse</p>
                <div className="w-48 h-2 bg-muted rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-primary w-[75%] rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                </div>
             </div>
             <span className="text-2xl font-bold text-primary">75%</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.stats.map((stat: any) => {
          const Icon = getIcon(stat.icon);
          return (
            <div key={stat.label} className="group relative overflow-hidden bg-card border border-border/50 rounded-2xl p-6 transition-all hover:shadow-lg hover:border-primary/20">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon className="w-24 h-24" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
              <p className="mt-2 text-3xl font-extrabold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Content Areas - Same logic but refined cards */}

      {data?.role === 'doctor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>Alertes Récentes</h3>
              <span className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm">
                {data?.urgent_patients?.length || 0} alertes
              </span>
            </div>
            <div className="space-y-3">
              {data?.urgent_patients && data.urgent_patients.length > 0 ? (
                data.urgent_patients.map((patient: any) => (
                  <Link
                    key={patient.id}
                    to={`/app/dmp/${patient.id_patient}`}
                    className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{patient.name}</p>
                        <span className="px-2 py-0.5 bg-destructive text-destructive-foreground rounded text-xs">
                          {patient.bloodGroup}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{patient.id_patient}</p>
                      <p className="text-sm text-destructive mt-1">{patient.reason}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {t('no_alerts')}
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>{t('patients_today')}</h3>
              <span className="text-sm text-muted-foreground">{data?.today_patients?.length || 0} {t('appointments')}</span>
            </div>
            <div className="space-y-3">
              {data?.today_patients && data.today_patients.length > 0 ? (
                data.today_patients.map((patient: any) => (
                  <Link
                    key={patient.id}
                    to={`/app/dmp/${patient.patient_id}`}
                    className="flex items-center gap-4 p-3 border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold">{patient.patient_name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{patient.patient_name}</p>
                      <p className="text-sm text-muted-foreground">{patient.patient_id} • {patient.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{patient.time}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        patient.status === 'Confirmé' ? 'bg-green-500/10 text-green-600' : 
                        patient.status === 'En attente' ? 'bg-orange-500/10 text-orange-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {patient.status}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t('no_appointments_today')}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {t('upcoming_appointments')}
            </h3>
            <div className="space-y-4">
              {data?.my_appointments && data.my_appointments.length > 0 ? (
                data.my_appointments.map((appt: any) => (
                  <div key={appt.id} className="flex items-center justify-between p-4 border border-border rounded-xl bg-accent/20">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold">{appt.doctor_name}</p>
                        <p className="text-sm text-muted-foreground">{appt.date} à {appt.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        appt.status === 'confirmed' ? 'bg-green-500/10 text-green-600' : 
                        appt.status === 'pending' ? 'bg-orange-500/10 text-orange-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {appt.status === 'confirmed' ? t('confirmed') : appt.status === 'pending' ? t('pending') : appt.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>{t('no_upcoming_appointments')}</p>
                  <Link to="/app/book-appointment" className="text-primary hover:underline mt-2 inline-block">{t('book_first_appointment')}</Link>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-chart-3" />
              Mes Derniers Documents
            </h3>
            <div className="space-y-3">
              {data?.my_records && data.my_records.length > 0 ? (
                data.my_records.map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/10 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{record.diagnosis}</p>
                      <p className="text-xs text-muted-foreground mt-1">{record.date} • {record.doctor}</p>
                    </div>
                    <button 
                      onClick={() => downloadPDF(record)}
                      className="p-2 text-primary hover:bg-primary hover:text-white rounded-full transition-all border border-primary/20"
                      title="Télécharger PDF"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Aucun document disponible.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
