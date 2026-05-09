import { useEffect, useState } from "react";
import { User, Shield, Bell, Lock, Activity, Save, Camera } from "lucide-react";
import { toast } from "sonner";
import api from "../api";
import { useTranslation } from "react-i18next";

export function Settings() {
  const { i18n, t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState<any>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    toast.success(`${t('language')} ${t('changed')}`);
  };

  useEffect(() => {
    api.get('me/').then(res => setUser(res.data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2>{t('settings')}</h2>
      <div className="flex gap-6">
        <aside className="w-64 space-y-2">
          {[
            { id: 'profile', label: t('profile'), icon: User },
            { id: 'security', label: 'Sécurité', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'health', label: 'Santé', icon: Activity },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id ? 'bg-primary text-white' : 'hover:bg-accent'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </aside>
...
        <main className="flex-1 bg-card border border-border rounded-lg p-6">
          {activeTab === 'profile' && <ProfileSettings user={user} onLangChange={changeLanguage} />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'health' && <HealthSettings role={user?.role} />}
        </main>
      </div>
    </div>
  );
}

function ProfileSettings({ user, onLangChange }: { user: any, onLangChange: (l: string) => void }) {
  const [photo, setPhoto] = useState<string | null>(null);
  const { i18n } = useTranslation();
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        toast.success("Photo sélectionnée !");
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    try {
      await api.patch('update-profile/', formData);
      toast.success("Profil mis à jour !");
    } catch (e) {
      toast.error("Erreur de sauvegarde");
    }
  };

  return (
    <div className="space-y-6">
      <h3>Profil {user?.role === 'doctor' ? 'Médecin' : 'Patient'}</h3>
      <div className="flex items-center gap-6">
        <img 
          src={photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
          className="w-24 h-24 rounded-full border-4 border-primary object-cover"
        />
        <label className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          <Camera className="w-4 h-4" /> Choisir une photo
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm">Prénom</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded" 
            value={formData.first_name}
            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
          />
        </div>
        <div>
          <label className="text-sm">Nom</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded" 
            value={formData.last_name}
            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
          />
        </div>
        <div>
          <label className="text-sm">Langue préférée</label>
          <select 
            className="w-full p-2 border rounded" 
            value={i18n.language}
            onChange={(e) => onLangChange(e.target.value)}
          >
            {[
              { code: 'fr', name: 'Français' }, { code: 'en', name: 'English' }, { code: 'es', name: 'Español' },
              { code: 'de', name: 'Deutsch' }, { code: 'it', name: 'Italiano' }, { code: 'pt', name: 'Português' },
              { code: 'zh', name: '中文' }, { code: 'ar', name: 'العربية' }, { code: 'ru', name: 'Русский' },
              { code: 'ja', name: '日本語' }, { code: 'ko', name: '한국어' }, { code: 'hi', name: 'हिन्दी' },
              { code: 'tr', name: 'Türkçe' }, { code: 'nl', name: 'Nederlands' }, { code: 'pl', name: 'Polski' },
              { code: 'sv', name: 'Svenska' }, { code: 'da', name: 'Dansk' }, { code: 'fi', name: 'Suomi' },
              { code: 'el', name: 'Ελληνικά' }, { code: 'cs', name: 'Čeština' }
            ].map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
      </div>
      <button onClick={saveProfile} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded">
        <Save className="w-4 h-4" /> Enregistrer le profil
      </button>
    </div>
  );
}


function SecuritySettings() {
  return (
    <div className="space-y-4">
      <h3>Sécurité</h3>
      <p className="text-sm text-muted-foreground">Gérez vos mots de passe et sessions actives.</p>
      <button className="flex items-center gap-2 border px-4 py-2 rounded hover:bg-accent">
        <Lock className="w-4 h-4" /> Changer le mot de passe
      </button>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-4">
      <h3>Préférences Notifications</h3>
      <div className="space-y-2">
        <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Notifications par Email</label>
        <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Notifications Push (Application)</label>
        <label className="flex items-center gap-2"><input type="checkbox" /> SMS (Alertes urgentes uniquement)</label>
      </div>
    </div>
  );
}

function HealthSettings() {
  return (
    <div className="space-y-4">
      <h3>Données Médicales</h3>
      <div>
        <label>Groupe Sanguin</label>
        <select className="w-full p-2 border rounded">
          <option>A+</option>
          <option>O+</option>
          <option>B+</option>
          <option>AB-</option>
        </select>
      </div>
      <div>
        <label>Allergies connues</label>
        <textarea className="w-full p-2 border rounded" placeholder="Ex: Pénicilline, Arachides..." />
      </div>
      <button className="bg-primary text-white px-4 py-2 rounded">Sauvegarder les données</button>
    </div>
  );
}
