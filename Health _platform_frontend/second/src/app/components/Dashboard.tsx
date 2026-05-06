import { Users, AlertCircle, Calendar, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router";

export function Dashboard() {
  const stats = [
    {
      label: "Patients Aujourd'hui",
      value: "24",
      icon: Users,
      trend: "+12%",
      trendUp: true,
      color: "primary"
    },
    {
      label: "Alertes Urgentes",
      value: "3",
      icon: AlertCircle,
      trend: "-25%",
      trendUp: false,
      color: "destructive"
    },
    {
      label: "Rendez-vous",
      value: "18",
      icon: Calendar,
      trend: "+8%",
      trendUp: true,
      color: "secondary"
    },
    {
      label: "Consultations",
      value: "156",
      icon: Activity,
      trend: "+15%",
      trendUp: true,
      color: "chart-3"
    },
  ];

  const urgentPatients = [
    {
      id: "P-2401",
      name: "Koffi Adjoua",
      age: 45,
      reason: "Hypertension sévère",
      bloodGroup: "O+",
      status: "urgent"
    },
    {
      id: "P-2402",
      name: "Fatou Diallo",
      age: 32,
      reason: "Diabète décompensé",
      bloodGroup: "A+",
      status: "urgent"
    },
    {
      id: "P-2403",
      name: "Mohamed Traoré",
      age: 58,
      reason: "Douleur thoracique",
      bloodGroup: "B+",
      status: "critical"
    },
  ];

  const todayPatients = [
    { id: "P-2404", name: "Aya N'Guessan", time: "09:00", status: "En attente", type: "Consultation" },
    { id: "P-2405", name: "Ibrahim Koné", time: "09:30", status: "En consultation", type: "Suivi" },
    { id: "P-2406", name: "Mariam Bamba", time: "10:00", status: "En attente", type: "Bilan" },
    { id: "P-2407", name: "Yao Kouassi", time: "10:30", status: "Terminé", type: "Vaccination" },
    { id: "P-2408", name: "Aminata Sow", time: "11:00", status: "En attente", type: "Consultation" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2>Tableau de Bord</h2>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité médicale</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown;
          return (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <p className="mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color === 'primary' ? 'bg-primary/10' : stat.color === 'destructive' ? 'bg-destructive/10' : stat.color === 'secondary' ? 'bg-secondary/10' : 'bg-chart-3/10'}`}>
                  <Icon className={`w-6 h-6 ${stat.color === 'primary' ? 'text-primary' : stat.color === 'destructive' ? 'text-destructive' : stat.color === 'secondary' ? 'text-secondary' : 'text-chart-3'}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <TrendIcon className={`w-4 h-4 ${stat.trendUp ? 'text-secondary' : 'text-destructive'}`} />
                <span className={`text-sm ${stat.trendUp ? 'text-secondary' : 'text-destructive'}`}>
                  {stat.trend}
                </span>
                <span className="text-sm text-muted-foreground">vs mois dernier</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Alertes Urgentes</h3>
            <span className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm">
              {urgentPatients.length} patients
            </span>
          </div>
          <div className="space-y-3">
            {urgentPatients.map((patient) => (
              <Link
                key={patient.id}
                to={`/dashboard/dmp/${patient.id}`}
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
                  <p className="text-sm text-muted-foreground">{patient.id} • {patient.age} ans</p>
                  <p className="text-sm text-destructive mt-1">{patient.reason}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs ${
                  patient.status === 'critical'
                    ? 'bg-destructive text-destructive-foreground'
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  {patient.status === 'critical' ? 'Critique' : 'Urgent'}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Patients du Jour</h3>
            <span className="text-sm text-muted-foreground">{todayPatients.length} consultations</span>
          </div>
          <div className="space-y-3">
            {todayPatients.map((patient) => (
              <Link
                key={patient.id}
                to={`/dashboard/dmp/${patient.id}`}
                className="flex items-center gap-4 p-3 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary">{patient.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">{patient.id} • {patient.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{patient.time}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    patient.status === 'En consultation'
                      ? 'bg-secondary/10 text-secondary'
                      : patient.status === 'Terminé'
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {patient.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
