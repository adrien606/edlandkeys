import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupabaseStore } from "@/hooks/useSupabaseStore";
import { ClipboardList, UserPlus, History, ArrowLeft, Users } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface InspectionDashboardProps {
  onNavigate: (route: string) => void;
  onBackToApps: () => void;
  onSwitchApp?: () => void;
}

export const InspectionDashboard = ({ onNavigate, onBackToApps, onSwitchApp }: InspectionDashboardProps) => {
  const navigate = useNavigate();
  const { clients, inspections } = useSupabaseStore();

  const recentInspections = inspections
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const totalInspections = inspections.length;
  const entryInspections = inspections.filter(i => i.type === 'entry').length;
  const exitInspections = inspections.filter(i => i.type === 'exit').length;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">États des Lieux</h1>
            <p className="text-muted-foreground">Gestion des entrées et sorties</p>
          </div>
          <div className="flex gap-2">
            {onSwitchApp && (
              <Button variant="outline" onClick={onSwitchApp}>
                Gestion Équipements
              </Button>
            )}
            <Button variant="outline" onClick={onBackToApps}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux apps
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Total États des Lieux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalInspections}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">États d'Entrée</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{entryInspections}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">États de Sortie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{exitInspections}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={() => onNavigate('new-inspection')}
            className="h-20 text-lg"
            size="lg"
          >
            <ClipboardList className="w-6 h-6 mr-3" />
            Nouvel État des Lieux
          </Button>

          <Button 
            onClick={() => onNavigate('inspection-history')}
            variant="outline"
            className="h-20 text-lg"
            size="lg"
          >
            <History className="w-6 h-6 mr-3" />
            Historique
          </Button>

          <Button 
            onClick={() => navigate('/clients')}
            variant="outline"
            className="h-20 text-lg"
            size="lg"
          >
            <Users className="w-6 h-6 mr-3" />
            Gestion Clients
          </Button>
        </div>

        {/* États des lieux récents */}
        <Card>
          <CardHeader>
            <CardTitle>États des Lieux Récents</CardTitle>
          </CardHeader>
          <CardContent>
            {recentInspections.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucun état des lieux enregistré
              </p>
            ) : (
              <div className="space-y-3">
                {recentInspections.map((inspection) => (
                  <div 
                    key={inspection.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{inspection.client_name}</h3>
                        <Badge variant={inspection.type === 'entry' ? 'default' : 'secondary'}>
                        {inspection.type === 'entry' ? 'Entrée' : 'Sortie'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(inspection.date), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onNavigate(`inspection-detail/${inspection.id}`)}
                    >
                      Voir
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info clients */}
        <Card>
          <CardHeader>
            <CardTitle>Clients Enregistrés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary mb-2">
              {clients.length}
            </div>
            <p className="text-muted-foreground">
              Clients disponibles pour les états des lieux
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};