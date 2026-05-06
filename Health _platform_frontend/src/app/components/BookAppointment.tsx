import { useEffect, useState } from "react";
import { User, Calendar, Clock, Loader2, CheckCircle, Search, Stethoscope, AlertCircle, Clock3 } from "lucide-react";
import api from "../api";
import { toast } from "sonner";

export function BookAppointment() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState("");

  const fetchData = async () => {
    try {
      const [docsRes, apptsRes] = await Promise.all([
        api.get("/list-doctors/"),
        api.get("/book-appointment/")
      ]);
      setDoctors(docsRes.data);
      setMyAppointments(apptsRes.data);
    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectDoctor = async (doctor: any) => {
    setSelectedDoctor(doctor);
    setIsLoadingSlots(true);
    try {
      const response = await api.get(`/availability/?doctor_id=${doctor.id}`);
      setAvailabilities(response.data);
    } catch (error) {
      console.error("Erreur récup créneaux:", error);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleBook = async (slotId: number) => {
    setIsSubmitting(true);
    try {
      await api.post("/book-appointment/", {
        availability_id: slotId,
        reason: reason || "Consultation générale"
      });
      toast.success("Rendez-vous réservé !");
      setSelectedDoctor(null);
      setAvailabilities([]);
      // Recharger les rendez-vous après réservation
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la réservation.");
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

  return (
    <div className="space-y-10">
      <div>
        <h2>Prendre un Rendez-vous</h2>
        <p className="text-muted-foreground">Choisissez votre médecin et gérez vos rendez-vous en quelques secondes</p>
      </div>

      {/* Mes Rendez-vous en cours */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="mb-6 flex items-center gap-2">
          <Clock3 className="w-5 h-5 text-secondary" />
          Mes Rendez-vous (En attente & Confirmés)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myAppointments.filter(a => ['pending', 'confirmed'].includes(a.status)).map((appt) => (
            <div key={appt.id} className="p-4 border border-border rounded-lg bg-accent/20 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <p className="font-bold">{appt.doctor_name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  appt.status === 'confirmed' ? 'bg-green-500/20 text-green-600' : 'bg-orange-500/20 text-orange-600'
                }`}>
                  {appt.status_label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {appt.date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {appt.time}
                </div>
              </div>
              <p className="text-xs italic truncate">"{appt.reason}"</p>
            </div>
          ))}
          {myAppointments.filter(a => ['pending', 'confirmed'].includes(a.status)).length === 0 && (
            <div className="col-span-full py-6 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
               <AlertCircle className="w-8 h-8 opacity-20" />
               <p>Vous n'avez aucun rendez-vous en cours.</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-10">
        <h3 className="mb-6">Réserver un nouveau créneau</h3>
        {!selectedDoctor ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer" onClick={() => handleSelectDoctor(doctor)}>
                <div className="flex items-center gap-4 mb-4">
                  <img src={doctor.photo} alt={doctor.name} className="w-16 h-16 rounded-full border-2 border-primary" />
                  <div>
                    <h3 className="font-bold">{doctor.name}</h3>
                    <p className="text-sm text-primary flex items-center gap-1">
                      <Stethoscope className="w-3 h-3" />
                      {doctor.specialty}
                    </p>
                  </div>
                </div>
                <button className="w-full py-2 bg-accent hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors text-sm font-medium">
                  Voir disponibilités
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-6">
                <button onClick={() => setSelectedDoctor(null)} className="text-sm text-primary hover:underline mb-4">← Retour à la liste</button>
                <div className="flex items-center gap-4 mb-6">
                  <img src={selectedDoctor.photo} alt={selectedDoctor.name} className="w-12 h-12 rounded-full" />
                  <div>
                    <p className="font-bold">{selectedDoctor.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedDoctor.specialty}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Motif de consultation</label>
                    <textarea 
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Ex: Fièvre, maux de tête..."
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Sélectionnez un créneau à droite pour valider votre demande.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-secondary" />
                  Créneaux disponibles
                </h3>

                {isLoadingSlots ? (
                  <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
                ) : (
                  <div className="space-y-6">
                    {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map(day => {
                    const daySlots = availabilities.filter(s => s.day === day);
                    if (daySlots.length === 0) return null;

                    return (
                      <div key={day}>
                        <h4 className="font-bold mb-3">{day}</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {daySlots.map((slot) => (
                            <button
                              key={slot.id}
                              disabled={isSubmitting}
                              onClick={() => handleBook(slot.id)}
                              className="px-4 py-3 text-sm bg-accent hover:bg-primary hover:text-primary-foreground rounded-lg border border-border transition-all flex items-center justify-between"
                            >
                              <span>{slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}</span>
                              <CheckCircle className="w-4 h-4 opacity-0 hover:opacity-100" />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                    })}

                    {availabilities.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Aucune disponibilité annoncée pour ce médecin.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
