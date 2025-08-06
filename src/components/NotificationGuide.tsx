import { ArrowLeft, Smartphone, MessageSquare, Phone, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NotificationGuideProps {
  onBack: () => void;
}

export function NotificationGuide({ onBack }: NotificationGuideProps) {
  const steps = [
    {
      number: 1,
      title: "Rechercher un client",
      description: "Utilisez la barre de recherche pour trouver un client par son nom, prénom ou email. Vous pouvez aussi filtrer par bâtiment.",
      icon: <Smartphone className="h-6 w-6 text-blue-500" />,
      tips: [
        "La recherche s'effectue en temps réel",
        "Vous pouvez combiner recherche et filtre par bâtiment",
        "Le nombre de clients s'affiche en temps réel"
      ]
    },
    {
      number: 2,
      title: "Personnaliser les messages",
      description: "Configurez vos modèles de messages SMS et WhatsApp avec des variables personnalisables comme {clientName}.",
      icon: <Settings className="h-6 w-6 text-purple-500" />,
      tips: [
        "Utilisez {clientName} pour personnaliser le message",
        "Les messages SMS sont limités à 160 caractères",
        "WhatsApp supporte les emojis et retours à la ligne"
      ]
    },
    {
      number: 3,
      title: "Envoyer un SMS",
      description: "Cliquez sur le bouton SMS pour ouvrir l'application native de votre appareil avec le message pré-rempli.",
      icon: <MessageSquare className="h-6 w-6 text-blue-500" />,
      tips: [
        "Fonctionne sur mobile et ordinateur",
        "Le message est automatiquement personnalisé",
        "En cas d'échec, le message est copié dans le presse-papiers"
      ]
    },
    {
      number: 4,
      title: "Envoyer via WhatsApp",
      description: "Cliquez sur le bouton WhatsApp pour ouvrir WhatsApp Web avec le message formaté et le bon numéro.",
      icon: <Phone className="h-6 w-6 text-green-600" />,
      tips: [
        "Ouvre WhatsApp Web dans un nouvel onglet",
        "Les numéros français sont automatiquement formatés",
        "Le message supporte les emojis et la mise en forme"
      ]
    }
  ];

  const features = [
    {
      title: "🔍 Recherche intelligente",
      description: "Trouvez rapidement vos clients par nom, prénom ou email"
    },
    {
      title: "🏢 Filtres par bâtiment",
      description: "Organisez vos clients par bâtiment pour une meilleure efficacité"
    },
    {
      title: "📱 Applications natives",
      description: "Utilise les apps SMS et WhatsApp de votre appareil"
    },
    {
      title: "✉️ Messages personnalisés",
      description: "Templates configurables avec variables automatiques"
    },
    {
      title: "📊 Historique complet",
      description: "Suivez toutes vos notifications envoyées"
    },
    {
      title: "🎯 Compatibilité totale",
      description: "Fonctionne sur mobile, tablette et ordinateur"
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          className="h-10 w-10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Guide d'utilisation</h1>
          <p className="text-muted-foreground">Apprenez à utiliser le système de notifications en 4 étapes simples</p>
        </div>
      </div>

      {/* Étapes */}
      <div className="space-y-6 mb-8">
        {steps.map((step) => (
          <Card key={step.number}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {step.number}
                </div>
                <div className="flex items-center space-x-2">
                  {step.icon}
                  <span>{step.title}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{step.description}</p>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">💡 Conseils :</h4>
                <ul className="space-y-1">
                  {step.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                      <span className="text-primary">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fonctionnalités */}
      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalités principales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes importantes */}
      <Card className="mt-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-blue-700 dark:text-blue-300">📋 Notes importantes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            <li className="flex items-start space-x-2">
              <span>•</span>
              <span><strong>SMS :</strong> Limité à 160 caractères, utilise l'app native de votre appareil</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>•</span>
              <span><strong>WhatsApp :</strong> Ouvre WhatsApp Web, nécessite une connexion internet</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>•</span>
              <span><strong>Historique :</strong> Toutes les notifications sont automatiquement enregistrées</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>•</span>
              <span><strong>Compatibilité :</strong> Testé sur iOS, Android, Windows, Mac</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}