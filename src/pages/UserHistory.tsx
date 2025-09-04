import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Calendar, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  details: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

const UserHistory = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserActivities();
  }, []);

  const fetchUserActivities = async () => {
    try {
      setLoading(true);
      
      // Simuler des données d'activité utilisateur pour démonstration
      // Dans une vraie app, cela viendrait d'une table d'audit/logs
      const mockActivities: UserActivity[] = [
        {
          id: "1",
          user_id: user?.id || "",
          action: "Connexion",
          details: "Connexion réussie à l'application",
          created_at: new Date().toISOString(),
          user_email: user?.email,
          user_name: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Utilisateur"
        },
        {
          id: "2", 
          user_id: user?.id || "",
          action: "Navigation",
          details: "Accès à la page gestion des utilisateurs",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          user_email: user?.email,
          user_name: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Utilisateur"
        },
        {
          id: "3",
          user_id: user?.id || "",
          action: "Consultation",
          details: "Consultation de l'historique des activités",
          created_at: new Date(Date.now() - 7200000).toISOString(),
          user_email: user?.email,
          user_name: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Utilisateur"
        }
      ];

      setActivities(mockActivities);
    } catch (error) {
      console.error("Erreur lors de la récupération des activités:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'connexion':
        return 'default';
      case 'navigation':
        return 'secondary';
      case 'consultation':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p>Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Historique Utilisateur</h1>
            <p className="text-muted-foreground">Consultez vos activités récentes</p>
          </div>
        </div>

        <div className="grid gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations Utilisateur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nom</p>
                  <p className="text-lg">{`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Non défini"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dernière connexion</p>
                  <p className="text-lg">{format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Historique des Activités
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Aucune activité trouvée</p>
                <p className="text-muted-foreground">Vos activités récentes apparaîtront ici</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Heure</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Détails</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        {format(new Date(activity.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {activity.action}
                      </TableCell>
                      <TableCell>
                        {activity.details}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionColor(activity.action)}>
                          Réalisée
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserHistory;