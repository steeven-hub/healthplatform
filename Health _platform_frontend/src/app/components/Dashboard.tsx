import { useEffect, useState } from "react";
import { Users, AlertCircle, Calendar, Activity, TrendingUp, TrendingDown, Loader2, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router";
import api from "../api";

export function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="space-y-6">
      <div>
        <h2>{data?.role === 'doctor' ? 'Tableau de Bord Médical' : 'Espace Patient'}</h2>
        <p className="text-muted-foreground">Bienvenue sur votre interface personnalisée</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data?.stats.map((stat: any) => {
          const Icon = getIcon(stat.icon);
          return (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${
                  stat.color === 'primary' ? 'bg-primary/10' : 
                  stat.color === 'secondary' ? 'bg-secondary/10' : 
                  'bg-chart-3/10'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    stat.color === 'primary' ? 'text-primary' : 
                    stat.color === 'secondary' ? 'text-secondary' : 
                    'text-chart-3'
                  }`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
                  Aucune alerte urgente.
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>Patients du Jour</h3>
              <span className="text-sm text-muted-foreground">{data?.today_patients?.length || 0} rendez-vous</span>
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
                  Aucun rendez-vous prévu aujourd'hui.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Mes Prochains Rendez-vous
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
                      {appt.status === 'confirmed' ? 'Confirmé' : appt.status === 'pending' ? 'En attente' : appt.status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[150px] truncate">{appt.reason}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Vous n'avez pas de rendez-vous à venir.</p>
                <Link to="/app/book-appointment" className="text-primary hover:underline mt-2 inline-block">Prendre mon premier rendez-vous</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
