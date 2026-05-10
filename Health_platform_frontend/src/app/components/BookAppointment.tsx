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
      const [doctorsRes, appointmentsRes] = await Promise.all([
        api.get("list-doctors/"),
        api.get("book-appointment/")
      ]);
      setDoctors(doctorsRes.data);
      setMyAppointments(appointmentsRes.data);    } catch (error) {
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
      const response = await api.get(`availability/?doctor_id=${doctor.id}`);
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
      await api.post("book-appointment/", {
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
    <div className="space-y-12 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Prendre un Rendez-vous</h2>
        <p className="text-muted-foreground mt-1">Choisissez votre médecin et gérez vos rendez-vous en quelques secondes</p>
      </div>

      {/* Mes Rendez-vous en cours */}
      <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
        <h3 className="mb-8 flex items-center gap-3 text-xl font-bold">
          <div className="p-2 bg-secondary/10 rounded-xl">
            <Clock3 className="w-5 h-5 text-secondary" />
          </div>
          Mes Rendez-vous
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myAppointments.filter(a => ['pending', 'confirmed'].includes(a.status)).map((appt) => (
            <div key={appt.id} className="group p-6 border border-border/50 rounded-2xl bg-card hover:border-primary/20 transition-all shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <p className="font-bold text-lg">{appt.doctor_name}</p>
                <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                  appt.status === 'confirmed' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'
                }`}>
                  {appt.status_label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 bg-accent/30 px-3 py-1 rounded-lg">
                  <Calendar className="w-3.5 h-3.5" />
                  {appt.date}
                </div>
                <div className="flex items-center gap-1.5 bg-accent/30 px-3 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5" />
                  {appt.time}
                </div>
              </div>
              <p className="text-sm italic text-muted-foreground/80 mt-4 line-clamp-2">"{appt.reason}"</p>
            </div>
          ))}
          {myAppointments.filter(a => ['pending', 'confirmed'].includes(a.status)).length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground flex flex-col items-center gap-4">
               <div className="p-4 bg-muted/50 rounded-full">
                 <AlertCircle className="w-8 h-8 opacity-40" />
               </div>
               <p className="text-sm font-medium">Vous n'avez aucun rendez-vous en cours.</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-12">
        <h3 className="text-2xl font-bold mb-8">Réserver un nouveau créneau</h3>
        {!selectedDoctor ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="group bg-card border border-border/50 rounded-3xl p-6 hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer" onClick={() => handleSelectDoctor(doctor)}>
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative">
                     <img src={doctor.photo} alt={doctor.name} className="w-20 h-20 rounded-2xl object-cover border-4 border-background shadow-md" />
                     <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-background" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{doctor.name}</h3>
                    <p className="text-sm text-primary font-medium flex items-center gap-1.5 mt-1">
                      <Stethoscope className="w-3.5 h-3.5" />
                      {doctor.specialty}
                    </p>
                  </div>
                </div>
                <button className="w-full py-3 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl transition-all text-sm font-bold tracking-wide">
                  Voir disponibilités
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-card border border-border/50 rounded-3xl p-8 sticky top-8 shadow-sm">
                <button onClick={() => setSelectedDoctor(null)} className="text-sm font-semibold text-muted-foreground hover:text-primary mb-6 flex items-center gap-2">
                   ← Retour
                </button>
                <div className="flex items-center gap-4 mb-8">
                  <img src={selectedDoctor.photo} alt={selectedDoctor.name} className="w-16 h-16 rounded-2xl" />
                  <div>
                    <p className="font-bold text-lg">{selectedDoctor.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedDoctor.specialty}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider">Motif de consultation</label>
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Fièvre, maux de tête..."
                    className="w-full px-5 py-4 bg-accent/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
                <h3 className="mb-8 flex items-center gap-3 text-xl font-bold">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  Créneaux disponibles
                </h3>

                {isLoadingSlots ? (
                  <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
                ) : (
                  <div className="space-y-10">
                    {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map(day => {
                    const daySlots = availabilities.filter(s => s.day === day);
                    if (daySlots.length === 0) return null;

                    return (
                      <div key={day}>
                        <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">{day}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {daySlots.map((slot) => (
                            <button
                              key={slot.id}
                              disabled={isSubmitting}
                              onClick={() => handleBook(slot.id)}
                              className="px-4 py-4 text-sm font-semibold bg-card hover:bg-primary hover:text-primary-foreground rounded-2xl border border-border/50 hover:border-primary transition-all flex items-center justify-between shadow-sm"
                            >
                              <span>{slot.start_time.substring(0, 5)}</span>
                              <CheckCircle className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                    })}

                    {availabilities.length === 0 && (
                      <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-3xl">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">Aucune disponibilité annoncée.</p>
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
