import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Key, CreditCard, Radio, Package, Plus, Edit3 } from 'lucide-react';

interface StockItem {
  id: string;
  type: 'cle' | 'badge' | 'telecommande';
  numero: string;
  description?: string;
  statut: 'disponible' | 'attribue' | 'perdu' | 'maintenance';
  clientActuel?: string;
}

export const StockManagement = () => {
  const { clients } = useStore();
  const navigate = useNavigate();
  
  // Stock fictif pour démonstration - dans une vraie app, ceci serait dans le store
  const [stockItems, setStockItems] = useState<StockItem[]>([
    { id: '1', type: 'cle', numero: 'K001', description: 'Clé bureau A1', statut: 'disponible' },
    { id: '2', type: 'cle', numero: 'K002', description: 'Clé bureau A2', statut: 'attribue', clientActuel: 'Jean Dupont' },
    { id: '3', type: 'badge', numero: 'B001', description: 'Badge accès principal', statut: 'disponible' },
    { id: '4', type: 'badge', numero: 'B002', description: 'Badge accès principal', statut: 'attribue', clientActuel: 'Marie Martin' },
    { id: '5', type: 'telecommande', numero: 'T001', description: 'Télécommande portail', statut: 'disponible' },
    { id: '6', type: 'telecommande', numero: 'T002', description: 'Télécommande portail', statut: 'perdu' },
    { id: '7', type: 'cle', numero: 'K003', description: 'Clé bureau B1', statut: 'maintenance' },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('tous');
  const [filterStatus, setFilterStatus] = useState<string>('tous');

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'cle': return <Key className="h-4 w-4" />;
      case 'badge': return <CreditCard className="h-4 w-4" />;
      case 'telecommande': return <Radio className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponible': return 'bg-success text-success-foreground';
      case 'attribue': return 'bg-primary text-primary-foreground';
      case 'perdu': return 'bg-destructive text-destructive-foreground';
      case 'maintenance': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'disponible': return 'Disponible';
      case 'attribue': return 'Attribué';
      case 'perdu': return 'Perdu';
      case 'maintenance': return 'Maintenance';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'cle': return 'Clé';
      case 'badge': return 'Badge';
      case 'telecommande': return 'Télécommande';
      default: return type;
    }
  };

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.clientActuel?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'tous' || item.type === filterType;
    const matchesStatus = filterStatus === 'tous' || item.statut === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStats = () => {
    const total = stockItems.length;
    const disponible = stockItems.filter(item => item.statut === 'disponible').length;
    const attribue = stockItems.filter(item => item.statut === 'attribue').length;
    const perdu = stockItems.filter(item => item.statut === 'perdu').length;
    const maintenance = stockItems.filter(item => item.statut === 'maintenance').length;
    
    return { total, disponible, attribue, perdu, maintenance };
  };

  const stats = getStats();

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Gestion du stock</h1>
          <p className="text-sm text-muted-foreground">Inventaire des équipements</p>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Ajouter
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success">Disponibles</p>
                <p className="text-2xl font-bold text-success">{stats.disponible}</p>
              </div>
              <Key className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Répartition par statut</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
              <span className="text-sm font-medium">Attribués</span>
              <Badge className="bg-primary text-primary-foreground">{stats.attribue}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
              <span className="text-sm font-medium">Perdus</span>
              <Badge variant="destructive">{stats.perdu}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg col-span-2">
              <span className="text-sm font-medium">En maintenance</span>
              <Badge className="bg-warning text-warning-foreground">{stats.maintenance}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par référence, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          
          {/* Filter dropdowns */}
          <div className="grid grid-cols-2 gap-3">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les types</SelectItem>
                <SelectItem value="cle">Clés</SelectItem>
                <SelectItem value="badge">Badges</SelectItem>
                <SelectItem value="telecommande">Télécommandes</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="attribue">Attribué</SelectItem>
                <SelectItem value="perdu">Perdu</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Aucun équipement trouvé</p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getEquipmentIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{getTypeLabel(item.type)}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.numero}
                        </Badge>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.description}
                        </p>
                      )}
                      
                      {item.clientActuel && (
                        <p className="text-xs text-muted-foreground">
                          Attribué à: <span className="font-medium">{item.clientActuel}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(item.statut)}>
                      {getStatusLabel(item.statut)}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};