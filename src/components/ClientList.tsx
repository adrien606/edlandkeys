import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSupabaseStore } from '@/hooks/useSupabaseStore';
import { ArrowLeft, Search, Key, CreditCard, Radio, Eye, Phone, Mail } from 'lucide-react';

// Conditional import for useNavigate
let useNavigate: (() => any) | null = null;
try {
  const routerDom = require('react-router-dom');
  useNavigate = routerDom.useNavigate;
} catch {
  // Router not available, will use onBack instead
}

export const ClientList = ({ onSwitchApp, onBack }: { onSwitchApp?: () => void; onBack?: () => void }) => {
  const { clients } = useSupabaseStore();
  const navigate = useNavigate?.();
  const [searchTerm, setSearchTerm] = useState('');

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigate) {
      navigate('/');
    }
  };

  // Filter clients based on search term
  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.nom.toLowerCase().includes(searchLower) ||
      client.prenom.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.telephone.includes(searchTerm) ||
      client.equipements.some(eq => 
        eq.numero?.toLowerCase().includes(searchLower) ||
        eq.description?.toLowerCase().includes(searchLower) ||
        eq.type.toLowerCase().includes(searchLower)
      )
    );
  });

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'cle': return <Key className="h-3 w-3" />;
      case 'badge': return <CreditCard className="h-3 w-3" />;
      case 'telecommande': return <Radio className="h-3 w-3" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'remis': return 'bg-success text-success-foreground';
      case 'restitue': return 'bg-muted text-muted-foreground';
      case 'perdu': return 'bg-destructive text-destructive-foreground';
      case 'non_rendu': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'remis': return 'Remis';
      case 'restitue': return 'Restitué';
      case 'perdu': return 'Perdu';
      case 'non_rendu': return 'Non rendu';
      default: return status;
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Liste des clients</h1>
          <p className="text-sm text-muted-foreground">{filteredClients.length} client(s)</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client, équipement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Client List */}
      <div className="space-y-4">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Aucun client trouvé</p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  className="mt-2"
                >
                  Effacer la recherche
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {client.prenom} {client.nom}
                    </CardTitle>
                    <div className="flex flex-col gap-1 mt-2">
                      {client.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </div>
                      )}
                      {client.telephone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {client.telephone}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (navigate) {
                        navigate(`/client/${client.id}`);
                      }
                    }}
                    disabled={!navigate}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {client.equipements && client.equipements.length > 0 ? (
                  <div className="space-y-2">
                    {client.equipements.map((equipment, index) => (
                      <div key={equipment.id || index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getEquipmentIcon(equipment.type)}
                          <span className="text-sm">
                            {equipment.numero || `${equipment.type} ${index + 1}`}
                          </span>
                          {equipment.description && (
                            <span className="text-xs text-muted-foreground">
                              - {equipment.description}
                            </span>
                          )}
                        </div>
                        <Badge className={getStatusColor(equipment.statut)}>
                          {getStatusLabel(equipment.statut)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Aucun équipement
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};