import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { Users, Key, CreditCard, Radio, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { clients, getEquipmentStats } = useStore();
  const navigate = useNavigate();
  const stats = getEquipmentStats();

  const recentClients = clients.slice(-5).reverse();

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Gestion Équipements</h1>
        <p className="text-muted-foreground">Espace de coworking</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">Total actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              Équipements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total distribués</p>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Statut des équipements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">Remis</span>
              </div>
              <Badge variant="secondary">{stats.remis}</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Restitués</span>
              </div>
              <Badge variant="outline">{stats.restitue}</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">Perdus</span>
              </div>
              <Badge variant="destructive">{stats.perdu}</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">Non rendus</span>
              </div>
              <Badge className="bg-warning text-warning-foreground">{stats.nonRendu}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Clients récents</CardTitle>
        </CardHeader>
        <CardContent>
          {recentClients.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Aucun client encore</p>
          ) : (
            <div className="space-y-3">
              {recentClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">{client.prenom} {client.nom}</div>
                    <div className="text-sm text-muted-foreground">
                      {client.equipements.length} équipement(s)
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {client.equipements.map((eq) => (
                      <div key={eq.id} className="w-2 h-2 rounded-full bg-primary"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-3">
        <Button 
          size="lg" 
          onClick={() => navigate('/ajouter-client')}
          className="h-14"
        >
          <Users className="mr-2 h-5 w-5" />
          Ajouter un client
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => navigate('/remettre-equipement')}
          className="h-14"
        >
          <Key className="mr-2 h-5 w-5" />
          Remettre équipement
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => navigate('/clients')}
          className="h-14"
        >
          <CreditCard className="mr-2 h-5 w-5" />
          Voir tous les clients
        </Button>
      </div>
    </div>
  );
};