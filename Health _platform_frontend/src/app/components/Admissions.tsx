import { useEffect, useState } from "react";
import { UserPlus, Filter, Search, Clock, CheckCircle, XCircle, Loader2, Check, X } from "lucide-react";
import api from "../api";
import { toast } from "sonner";

export function Admissions() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPatient, setNewPatient] = useState({ name: "", age: "", phone: "", reason: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAdmissions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admissions/?status=${filterStatus}`);
      setAdmissions(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des admissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, [filterStatus]);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await api.patch(`/appointments/${id}/status/`, { status: newStatus });
      toast.success(`Rendez-vous ${newStatus === 'confirmed' ? 'confirmé' : 'mis à jour'}`);
      fetchAdmissions();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleAddPatient = async () => {
    if (!newPatient.name || !newPatient.phone) return;
    setIsSubmitting(true);
    try {
      await api.post("/admissions/create/", newPatient);
      setShowAddModal(false);
      setNewPatient({ name: "", age: "", phone: "", reason: "" });
      fetchAdmissions();
    } catch (error) {
      console.error("Erreur lors de l'admission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "En attente", color: "primary", icon: Clock };
      case "confirmed":
        return { label: "Confirmé", color: "secondary", icon: CheckCircle };
      case "cancelled":
        return { label: "Annulé", color: "muted", icon: XCircle };
      case "completed":
        return { label: "Terminé", color: "muted", icon: CheckCircle };
      default:
        return { label: status, color: "muted", icon: Clock };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Gestion des Admissions & RDV</h2>
          <p className="text-muted-foreground">Gérez les demandes de rendez-vous et les patients du jour</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Admission Directe
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
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
            {[
              { id: 'all', label: 'Tous' },
              { id: 'pending', label: 'En attente' },
              { id: 'confirmed', label: 'Confirmés' }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setFilterStatus(s.id)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  filterStatus === s.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-accent text-accent-foreground hover:bg-accent/80"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 text-sm font-bold text-muted-foreground">Date / Heure</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-muted-foreground">Patient</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-muted-foreground">Motif</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-muted-foreground">Statut</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admissions.length > 0 ? (
                  admissions.map((admission) => {
                    const statusInfo = getStatusInfo(admission.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <tr key={admission.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium">{admission.time}</div>
                          <div className="text-[10px] text-muted-foreground">{admission.date}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold">{admission.patientName}</div>
                          <div className="text-xs text-muted-foreground">{admission.patientId} • {admission.phone}</div>
                        </td>
                        <td className="py-4 px-4 text-sm max-w-[200px] truncate" title={admission.reason}>
                          {admission.reason}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            statusInfo.color === 'primary' ? 'bg-orange-500/10 text-orange-600' : 
                            statusInfo.color === 'secondary' ? 'bg-green-500/10 text-green-600' : 
                            'bg-muted text-muted-foreground'
                          }`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {admission.status === "pending" && (
                              <>
                                <button 
                                  onClick={() => handleUpdateStatus(admission.id, 'confirmed')}
                                  className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition-colors font-bold"
                                  title="Confirmer le rendez-vous"
                                >
                                  <Check className="w-3 h-3" /> Confirmer
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(admission.id, 'cancelled')}
                                  className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors border border-border"
                                  title="Annuler"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {admission.status === "confirmed" && (
                              <button 
                                className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-xs hover:bg-primary/90 transition-colors font-bold"
                                onClick={() => handleUpdateStatus(admission.id, 'completed')}
                              >
                                Terminer
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                       <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                       <p>Aucun rendez-vous ou admission pour ce filtre.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => !isSubmitting && setShowAddModal(false)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full m-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 font-bold text-xl">Admission Nouveau Patient</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom complet</label>
                <input 
                  type="text" 
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                  placeholder="Jean Dupont"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Âge</label>
                  <input 
                    type="number" 
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Téléphone</label>
                  <input 
                    type="tel" 
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="+225 01020304"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Motif d'admission</label>
                <textarea 
                  value={newPatient.reason}
                  onChange={(e) => setNewPatient({...newPatient, reason: e.target.value})}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                  rows={3}
                  placeholder="Symptômes constatés..."
                ></textarea>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  disabled={isSubmitting}
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  disabled={isSubmitting || !newPatient.name || !newPatient.phone}
                  onClick={handleAddPatient}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-bold"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
