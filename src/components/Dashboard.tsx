import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSupabaseStore } from '@/hooks/useSupabaseStore';
import { Users, Key, CreditCard, Radio, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BuildingSelector } from '@/components/BuildingSelector';

export const Dashboard = ({ onSwitchApp }: { onSwitchApp?: () => void }) => {
  const { clients, getEquipmentStats, buildings, currentBuildingId, isOnline, syncPending } = useSupabaseStore();
  const navigate = useNavigate();
  const stats = getEquipmentStats();
  const clientsInBuilding = currentBuildingId 
    ? clients.filter(c => c.equipements.some(eq => eq.batimentId === currentBuildingId))
    : clients;
  const currentBuilding = buildings.find(b => b.id === currentBuildingId);

  const recentClients = clientsInBuilding.slice(-5).reverse();

  return (
    <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Gestion Équipements</h1>
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <p className="text-sm text-muted-foreground">
              {currentBuilding ? `${currentBuilding.code} - ${currentBuilding.nom}` : 'Tous les bâtiments'}
            </p>
            <div className="flex items-center space-x-1">
              {syncPending && <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />}
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-muted-foreground">
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
          </div>
        </div>
        {onSwitchApp && (
          <Button variant="outline" size="sm" onClick={onSwitchApp} className="w-full sm:w-auto">
            État des lieux
          </Button>
        )}
      </div>

      {/* Building Selector */}
      <BuildingSelector />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsInBuilding.length}</div>
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
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
              <Badge className="bg-warning text-warning-foreground">{0}</Badge>
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
                    <div className="font-medium">{client.nom}</div>
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
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        <Button 
          size="lg" 
          onClick={() => navigate('/ajouter-client')}
          className="h-12 sm:h-14 text-sm sm:text-base"
        >
          <Users className="mr-2 h-5 w-5" />
          Ajouter un client
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => {
            console.log('[Dashboard] Navigating to /remettre-equipement');
            navigate('/remettre-equipement');
          }}
          className="h-12 sm:h-14 text-sm sm:text-base"
        >
          <Key className="mr-2 h-5 w-5" />
          Remettre équipement
        </Button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigate('/clients')}
            className="h-12 sm:h-14 text-sm sm:text-base"
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Voir clients
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigate('/stock')}
            className="h-12 sm:h-14 text-sm sm:text-base"
          >
            <Radio className="mr-2 h-5 w-5" />
            Gérer stock
          </Button>
        </div>
      </div>
    </div>
  );
};