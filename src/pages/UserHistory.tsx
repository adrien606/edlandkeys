import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Calendar, Activity, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  created_at: string;
  roles: string[];
}

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
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attendre que le statut admin soit déterminé avant de charger les utilisateurs
    if (isAdmin !== undefined) {
      fetchUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    console.log('isAdmin status:', isAdmin, 'user:', user?.id);
  }, [isAdmin, user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      console.log('fetchUsers called, isAdmin:', isAdmin);
      
      // Vérifier si l'utilisateur est admin
      if (!isAdmin) {
        console.error("Accès refusé: seuls les administrateurs peuvent voir tous les utilisateurs");
        setLoading(false);
        return;
      }
      
      console.log('Admin check passed, fetching profiles...');
      
      // Récupérer tous les profils utilisateurs
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error("Erreur profiles:", profilesError);
        throw profilesError;
      }

      console.log('Profiles fetched:', profiles?.length);

      // Récupérer les rôles pour chaque utilisateur
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id);

          return {
            ...profile,
            roles: roles?.map(r => r.role) || []
          };
        })
      );

      console.log('Users with roles:', usersWithRoles);
      setUsers(usersWithRoles);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      setLoading(false);
    }
  };

  const fetchUserActivities = async (selectedUserId: string) => {
    try {
      const selectedUserProfile = users.find(u => u.user_id === selectedUserId);
      
      // Simuler des données d'activité utilisateur pour démonstration
      const mockActivities: UserActivity[] = [
        {
          id: "1",
          user_id: selectedUserId,
          action: "Connexion",
          details: "Connexion réussie à l'application",
          created_at: new Date().toISOString(),
          user_email: selectedUserProfile?.email,
          user_name: `${selectedUserProfile?.first_name || ""} ${selectedUserProfile?.last_name || ""}`.trim() || "Utilisateur"
        },
        {
          id: "2", 
          user_id: selectedUserId,
          action: "Navigation",
          details: "Accès à la page gestion des équipements",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          user_email: selectedUserProfile?.email,
          user_name: `${selectedUserProfile?.first_name || ""} ${selectedUserProfile?.last_name || ""}`.trim() || "Utilisateur"
        },
        {
          id: "3",
          user_id: selectedUserId,
          action: "Ajout",
          details: "Ajout d'un nouveau client",
          created_at: new Date(Date.now() - 7200000).toISOString(),
          user_email: selectedUserProfile?.email,
          user_name: `${selectedUserProfile?.first_name || ""} ${selectedUserProfile?.last_name || ""}`.trim() || "Utilisateur"
        }
      ];

      setActivities(mockActivities);
    } catch (error) {
      console.error("Erreur lors de la récupération des activités:", error);
    }
  };

  const handleUserSelect = (user: UserProfile) => {
    setSelectedUser(user);
    fetchUserActivities(user.user_id);
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setActivities([]);
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'connexion':
        return 'default';
      case 'navigation':
        return 'secondary';
      case 'ajout':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p>Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur est admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Accès refusé</p>
            <p className="text-muted-foreground">Seuls les administrateurs peuvent accéder à cette page</p>
          </div>
        </div>
      </div>
    );
  }

  // Vue détail d'un utilisateur spécifique
  if (selectedUser) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={handleBackToUsers}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux utilisateurs
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Historique Utilisateur</h1>
              <p className="text-muted-foreground">
                {`${selectedUser.first_name || ""} ${selectedUser.last_name || ""}`.trim() || "Utilisateur"}
              </p>
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
                    <p className="text-lg">
                      {`${selectedUser.first_name || ""} ${selectedUser.last_name || ""}`.trim() || "Non défini"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-lg">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rôles</p>
                    <div className="flex gap-1 mt-1">
                      {selectedUser.roles.length > 0 ? (
                        selectedUser.roles.map((role) => (
                          <Badge key={role} variant={getRoleBadgeColor(role)}>
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline">user</Badge>
                      )}
                    </div>
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
                  <p className="text-muted-foreground">Les activités récentes apparaîtront ici</p>
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
  }

  // Vue liste des utilisateurs
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
                <p className="text-muted-foreground">Consultez la liste des utilisateurs et leur historique</p>
              </div>
            </div>
            <Button onClick={fetchUsers} variant="outline">
              Actualiser
            </Button>
          </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Liste des Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Aucun utilisateur trouvé</p>
                <p className="text-muted-foreground">Les utilisateurs apparaîtront ici</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôles</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {`${user.first_name || ""} ${user.last_name || ""}`.trim() || "Utilisateur"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <Badge key={role} variant={getRoleBadgeColor(role)}>
                                {role}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline">user</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), "dd/MM/yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUserSelect(user)}
                        >
                          <Activity className="w-4 h-4 mr-2" />
                          Voir historique
                        </Button>
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