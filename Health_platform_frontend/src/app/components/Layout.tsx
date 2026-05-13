import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Brain,
  UserPlus,
  Search,
  Bell,
  Settings,
  LogOut,
  User as UserIcon,
  Sun,
  Moon,
  Calendar,
  X
} from "lucide-react";
import { toast } from "sonner";
import api from "../api";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Thème avec initialisation simple
  useEffect(() => {
    const dark = localStorage.getItem("theme") === "dark";
    setIsDarkMode(dark);
    if (dark) document.documentElement.classList.add("dark");
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Initialisation utilisateur et notifications
  useEffect(() => {
    api.get("me/").then(res => setUser(res.data)).catch(console.error);
    
    const fetchNotifications = async () => {
      try {
        const res = await api.get("notifications/");
        setNotifications(res.data);
        setNotificationCount(res.data.filter((n: any) => !n.is_read).length);
      } catch (e) {
        console.error("Notifs error", e);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Check every 10s for more responsiveness
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await api.post("notifications/");
      setNotificationCount(0);
      setNotifications(prev => prev.map(n => ({...n, is_read: true})));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = user?.role === 'doctor' 
    ? [
        { path: "/app/dashboard", icon: LayoutDashboard, label: "Tableau de Bord" },
        { path: "/app/dmp", icon: FileText, label: "Liste Patients" },
        { path: "/app/availability", icon: Calendar, label: "Mes Dispos" },
        { path: "/app/admissions", icon: UserPlus, label: "Admissions" },
        { path: "/app/assistant", icon: Brain, label: "Assistant IA" },
      ]
    : [
        { path: "/app/dashboard", icon: LayoutDashboard, label: "Mon Accueil" },
        { path: "/app/dmp/my-profile", icon: FileText, label: "Mon Dossier" },
        { path: "/app/book-appointment", icon: Calendar, label: "Prendre RDV" },
        { path: "/app/assistant", icon: Brain, label: "Assistant IA" },
      ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">A+</span>
            </div>
            <span className="font-bold text-xl">AfriHealth</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Link
            to="/app/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/app/settings")
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Paramètres</span>
          </Link>
        </nav>

        <div className="p-4 mt-auto border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-3">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-accent-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user ? (user.role === 'doctor' ? `Dr. ${user.last_name}` : `${user.first_name} ${user.last_name}`) : "Chargement..."}
              </p>
              <p className="text-xs text-muted-foreground truncate capitalize">
                {user?.role === 'doctor' ? 'Médecin' : 'Patient'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un patient, un dossier..."
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground"
              title={isDarkMode ? "Passer au mode clair" : "Passer au mode sombre"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markAllRead();
                }}
                className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground relative"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center rounded-full animate-pulse shadow-sm shadow-destructive/50">
                    {notificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="p-4 border-b border-border flex justify-between items-center bg-accent/50">
                    <span className="font-bold text-sm">Mes Notifications</span>
                    <button onClick={() => setShowNotifications(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className={`p-4 border-b border-border last:border-0 hover:bg-accent/30 transition-colors ${!n.is_read ? 'bg-primary/5 border-l-4 border-l-primary' : 'opacity-80'}`}>
                          <p className={`text-xs font-bold mb-1 ${!n.is_read ? 'text-primary' : 'text-muted-foreground'}`}>{n.title}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-2 opacity-50 italic">
                            {new Date(n.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-muted-foreground text-sm">
                        Aucune notification pour le moment.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <Link 
              to="/app/settings"
              className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground"
              title="Paramètres"
            >
              <Settings className="w-5 h-5" />
            </Link>
            
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground"
              title="Se déconnecter"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 bg-background">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
