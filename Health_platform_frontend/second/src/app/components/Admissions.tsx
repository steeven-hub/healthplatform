import { useState } from "react";
import { UserPlus, Filter, Search, Clock, CheckCircle, XCircle } from "lucide-react";

export function Admissions() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const admissions = [
    {
      id: "A-2401",
      patientName: "Aya N'Guessan",
      patientId: "P-2404",
      age: 28,
      reason: "Consultation générale",
      status: "waiting",
      time: "09:00",
      priority: "normal",
      phone: "+225 07 11 22 33 44"
    },
    {
      id: "A-2402",
      patientName: "Ibrahim Koné",
      patientId: "P-2405",
      age: 52,
      reason: "Suivi diabète",
      status: "in-progress",
      time: "09:30",
      priority: "normal",
      phone: "+225 07 22 33 44 55"
    },
    {
      id: "A-2403",
      patientName: "Mariam Bamba",
      patientId: "P-2406",
      age: 35,
      reason: "Bilan sanguin",
      status: "waiting",
      time: "10:00",
      priority: "normal",
      phone: "+225 07 33 44 55 66"
    },
    {
      id: "A-2404",
      patientName: "Yao Kouassi",
      patientId: "P-2407",
      age: 6,
      reason: "Vaccination",
      status: "completed",
      time: "10:30",
      priority: "normal",
      phone: "+225 07 44 55 66 77"
    },
    {
      id: "A-2405",
      patientName: "Aminata Sow",
      patientId: "P-2408",
      age: 41,
      reason: "Douleur abdominale",
      status: "waiting",
      time: "11:00",
      priority: "urgent",
      phone: "+225 07 55 66 77 88"
    },
  ];

  const filteredAdmissions = filterStatus === "all"
    ? admissions
    : admissions.filter(a => a.status === filterStatus);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "waiting":
        return { label: "En attente", color: "primary", icon: Clock };
      case "in-progress":
        return { label: "En consultation", color: "secondary", icon: CheckCircle };
      case "completed":
        return { label: "Terminé", color: "muted", icon: CheckCircle };
      default:
        return { label: status, color: "muted", icon: Clock };
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === "urgent" ? "destructive" : "primary";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Gestion des Admissions</h2>
          <p className="text-muted-foreground">Gérez les patients en attente et les consultations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Nouveau Patient
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par nom, ID ou téléphone..."
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              }`}
            >
              Tous ({admissions.length})
            </button>
            <button
              onClick={() => setFilterStatus("waiting")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "waiting"
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              }`}
            >
              En attente ({admissions.filter(a => a.status === "waiting").length})
            </button>
            <button
              onClick={() => setFilterStatus("in-progress")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "in-progress"
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              }`}
            >
              En cours ({admissions.filter(a => a.status === "in-progress").length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Heure</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Patient</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Âge</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Motif</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Téléphone</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmissions.map((admission) => {
                const statusInfo = getStatusInfo(admission.status);
                const StatusIcon = statusInfo.icon;
                const priorityColor = getPriorityColor(admission.priority);

                return (
                  <tr key={admission.id} className="border-b border-border hover:bg-accent transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-medium">{admission.time}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {admission.priority === "urgent" && (
                          <div className="w-2 h-2 bg-destructive rounded-full"></div>
                        )}
                        <span className="font-medium">{admission.patientName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{admission.patientId}</td>
                    <td className="py-4 px-4 text-sm">{admission.age} ans</td>
                    <td className="py-4 px-4">
                      <span className={`text-sm ${admission.priority === 'urgent' ? 'text-destructive font-medium' : ''}`}>
                        {admission.reason}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{admission.phone}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                        statusInfo.color === 'primary'
                          ? 'bg-primary/10 text-primary'
                          : statusInfo.color === 'secondary'
                          ? 'bg-secondary/10 text-secondary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {admission.status === "waiting" && (
                          <button className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/90 transition-colors">
                            Commencer
                          </button>
                        )}
                        {admission.status === "in-progress" && (
                          <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors">
                            Terminer
                          </button>
                        )}
                        <button className="p-2 hover:bg-accent rounded transition-colors">
                          <XCircle className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full m-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4">Ajouter un Patient</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Nom complet</label>
                <input type="text" className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm mb-2">Âge</label>
                <input type="number" className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm mb-2">Téléphone</label>
                <input type="tel" className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm mb-2">Motif de consultation</label>
                <textarea className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" rows={3}></textarea>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
