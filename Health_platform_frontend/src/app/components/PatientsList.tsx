import { useEffect, useState } from "react";
import { Search, User, Phone, ArrowRight, Loader2, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api";

export function PatientsList() {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`patients-list/?search=${searchTerm}`);
      setPatients(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des patients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Base de Données Patients</h2>
          <p className="text-muted-foreground mt-1">Consultez et gérez l'ensemble des dossiers patients AfriHealth</p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, ID patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-accent/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button 
            type="submit"
            className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            Rechercher
          </button>
        </form>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.length > 0 ? (
              patients.map((patient) => (
                <Link
                  key={patient.id}
                  to={`/app/dmp/${patient.id}`}
                  className="group bg-card border border-border/50 rounded-3xl p-6 hover:shadow-xl hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors">
                      <UserRound className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg truncate">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">{patient.id}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {patient.phone || "Non renseigné"}
                    </div>
                    <div className="flex items-center gap-1 text-primary font-bold">
                      Voir dossier
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-muted-foreground bg-accent/10 rounded-3xl border-2 border-dashed border-border">
                <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">Aucun patient trouvé pour cette recherche.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
