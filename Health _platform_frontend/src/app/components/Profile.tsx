import { useEffect, useState } from "react";
import { User, Stethoscope, Mail, Phone, Loader2, BadgeCheck } from "lucide-react";
import api from "../api";

export function Profile() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const uRes = await api.get("/me/");
        setUser(uRes.data);
        // On récupère le profil complet (Patient ou Doctor)
        const pRes = await api.get("/patient-detail/my-profile/");
        setProfile(pRes.data);
      } catch (error) {
        console.error("Erreur profil:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2>Mon Profil</h2>
      <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.first_name} {user?.last_name}</h1>
            <p className="text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-accent rounded-lg">
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Nom d'utilisateur</p>
              <p className="font-medium">{user?.username}</p>
            </div>
          </div>
          {profile && (
            <div className="flex items-center gap-4 p-4 bg-accent rounded-lg">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Téléphone</p>
                <p className="font-medium">{profile.phone || "Non renseigné"}</p>
              </div>
            </div>
          )}
          {user?.role === 'doctor' && profile && (
            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <Stethoscope className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Spécialité & Licence</p>
                <p className="font-medium">{profile.specialty || "Généraliste"} • {profile.license_number || "Non renseigné"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
