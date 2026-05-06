import { useEffect, useState } from "react";
import { Calendar, Clock, Plus, Trash2, Loader2 } from "lucide-react";
import api from "../api";

export function Availability() {
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSlot, setNewRecord] = useState({ day: "Lundi", start_time: "09:00", end_time: "10:00" });

  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

  const fetchAvailabilities = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/availability/");
      setAvailabilities(response.data);
    } catch (error) {
      console.error("Erreur récup dispos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/availability/", newSlot);
      fetchAvailabilities();
    } catch (error) {
      console.error("Erreur ajout dispo:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2>Mes Disponibilités</h2>
        <p className="text-muted-foreground">Définissez vos créneaux horaires pour les rendez-vous clients</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Ajouter un créneau
            </h3>
            <form onSubmit={handleAddSlot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Jour</label>
                <select 
                  value={newSlot.day}
                  onChange={(e) => setNewRecord({...newSlot, day: e.target.value})}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Début</label>
                  <input 
                    type="time" 
                    value={newSlot.start_time}
                    onChange={(e) => setNewRecord({...newSlot, start_time: e.target.value})}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fin</label>
                  <input 
                    type="time" 
                    value={newSlot.end_time}
                    onChange={(e) => setNewRecord({...newSlot, end_time: e.target.value})}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Plus className="w-5 h-5" />}
                {isSubmitting ? "Ajout..." : "Ajouter"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-secondary" />
              Créneaux existants
            </h3>
            
            <div className="space-y-4">
              {days.map(day => {
                const daySlots = availabilities.filter(s => s.day === day);
                if (daySlots.length === 0) return null;
                
                return (
                  <div key={day} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <h4 className="font-bold text-primary mb-3">{day}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {daySlots.map((slot: any) => (
                        <div key={slot.id} className={`flex items-center justify-between p-3 rounded-lg border ${slot.is_booked ? 'bg-secondary/10 border-secondary/20' : 'bg-accent border-border'}`}>
                          <div className="flex items-center gap-3">
                            <Clock className={`w-4 h-4 ${slot.is_booked ? 'text-secondary' : 'text-muted-foreground'}`} />
                            <span className="text-sm font-medium">{slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}</span>
                          </div>
                          {slot.is_booked && (
                            <span className="text-[10px] px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full">Réservé</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {availabilities.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Aucun créneau défini pour le moment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
