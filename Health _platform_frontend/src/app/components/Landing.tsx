import { Link } from "react-router";
import {
  Activity,
  Brain,
  Shield,
  Smartphone,
  ArrowRight,
  CheckCircle,
  Users,
  FileText,
  BarChart3
} from "lucide-react";

export function Landing() {
  const features = [
    {
      icon: FileText,
      title: "Dossier Médical Partagé",
      description: "Centralisez tous les antécédents, consultations et prescriptions de vos patients en un seul endroit sécurisé."
    },
    {
      icon: Brain,
      title: "Assistant IA Médical",
      description: "Bénéficiez de suggestions diagnostiques intelligentes et de vérifications automatiques d'interactions médicamenteuses."
    },
    {
      icon: BarChart3,
      title: "Statistiques en Temps Réel",
      description: "Visualisez l'évolution des constantes vitales et suivez vos indicateurs de performance clinique."
    },
    {
      icon: Smartphone,
      title: "Accès Mobile",
      description: "Consultez les dossiers patients depuis n'importe quel appareil, même en déplacement."
    },
    {
      icon: Shield,
      title: "Sécurité Renforcée",
      description: "Conformité RGPD et chiffrement de bout en bout pour protéger les données sensibles."
    },
    {
      icon: Users,
      title: "Gestion d'Équipe",
      description: "Collaborez efficacement avec votre équipe médicale et partagez les informations en toute sécurité."
    },
  ];

  const stats = [
    { value: "10,000+", label: "Patients gérés" },
    { value: "500+", label: "Professionnels de santé" },
    { value: "99.9%", label: "Disponibilité" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A+</span>
            </div>
            <span className="font-bold text-xl">AfriHealth</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Fonctionnalités
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              À propos
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-primary hover:bg-accent rounded-lg transition-colors"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full mb-6">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Plateforme de Santé Digitale</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Modernisez votre pratique médicale avec <span className="text-primary">AfriHealth</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              La solution complète pour la gestion des dossiers médicaux, propulsée par l'intelligence artificielle.
              Simplifiez votre travail et offrez de meilleurs soins à vos patients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Commencer gratuitement
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Découvrir les fonctionnalités
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <span className="text-sm">Essai gratuit 30 jours</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <span className="text-sm">Sans engagement</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8">
              <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-primary px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                    <div className="w-3 h-3 rounded-full bg-chart-3"></div>
                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                  </div>
                  <span className="text-primary-foreground text-sm ml-4">AfriHealth Dashboard</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-accent rounded w-3/4"></div>
                      <div className="h-3 bg-accent rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-accent rounded-lg">
                      <div className="h-3 bg-muted rounded w-2/3 mb-2"></div>
                      <div className="h-6 bg-primary/20 rounded w-1/2"></div>
                    </div>
                    <div className="p-4 bg-accent rounded-lg">
                      <div className="h-3 bg-muted rounded w-2/3 mb-2"></div>
                      <div className="h-6 bg-secondary/20 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                        <div className="w-8 h-8 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-2 bg-muted rounded w-2/3"></div>
                          <div className="h-2 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card border-y border-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Des outils puissants pour optimiser votre pratique médicale et améliorer la qualité des soins
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Prêt à transformer votre pratique ?</h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez les centaines de professionnels de santé qui font confiance à AfriHealth
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-lg"
          >
            Commencer maintenant
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-card py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">A+</span>
                </div>
                <span className="font-bold">AfriHealth</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La plateforme de santé digitale pour l'Afrique
              </p>
            </div>
            <div>
              <h4 className="mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Sécurité</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Carrières</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 AfriHealth. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
