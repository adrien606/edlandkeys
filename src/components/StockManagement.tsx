import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Key, CreditCard, Radio, Package, Plus, Edit3, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

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
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    numero: '',
    description: '',
    statut: 'disponible' as StockItem['statut'],
    clientActuel: ''
  });
  const [addForm, setAddForm] = useState({
    type: 'cle' as StockItem['type'],
    numero: '',
    description: '',
    statut: 'disponible' as StockItem['statut']
  });

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

  const handleEditClick = (item: StockItem) => {
    setEditingItem(item);
    setEditForm({
      numero: item.numero,
      description: item.description || '',
      statut: item.statut,
      clientActuel: item.clientActuel || ''
    });
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    
    setStockItems(items => items.map(item => 
      item.id === editingItem.id 
        ? { 
            ...item, 
            numero: editForm.numero,
            description: editForm.description,
            statut: editForm.statut,
            clientActuel: editForm.statut === 'attribue' ? editForm.clientActuel : undefined
          }
        : item
    ));
    
    setEditingItem(null);
    toast.success('Équipement modifié avec succès');
  };

  const handleAddEquipment = () => {
    if (!addForm.numero.trim()) {
      toast.error('La référence est obligatoire');
      return;
    }

    // Vérifier l'unicité seulement pour les télécommandes et badges
    if (addForm.type === 'telecommande' || addForm.type === 'badge') {
      if (stockItems.some(item => 
        item.type === addForm.type && 
        item.numero.toLowerCase() === addForm.numero.toLowerCase()
      )) {
        const typeLabel = addForm.type === 'telecommande' ? 'télécommande' : 'badge';
        toast.error(`Cette référence de ${typeLabel} existe déjà. Les ${typeLabel}s doivent être uniques.`);
        return;
      }
    }
    // Pour les clés, on permet les doublons (pas de vérification d'unicité)

    const newItem: StockItem = {
      id: crypto.randomUUID(),
      type: addForm.type,
      numero: addForm.numero,
      description: addForm.description || undefined,
      statut: addForm.statut
    };

    setStockItems(items => [...items, newItem]);
    setAddForm({
      type: 'cle',
      numero: '',
      description: '',
      statut: 'disponible'
    });
    setIsAddDialogOpen(false);
    toast.success('Équipement ajouté avec succès');
  };

  const handleDeleteEquipment = (itemId: string) => {
    setStockItems(items => items.filter(item => item.id !== itemId));
    setItemToDelete(null);
    toast.success('Équipement supprimé avec succès');
  };

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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un équipement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Type d'équipement</Label>
                <Select value={addForm.type} onValueChange={(value: StockItem['type']) => 
                  setAddForm(prev => ({ ...prev, type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cle">Clé</SelectItem>
                    <SelectItem value="badge">Badge</SelectItem>
                    <SelectItem value="telecommande">Télécommande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="add-numero">Référence *</Label>
                <Input
                  id="add-numero"
                  value={addForm.numero}
                  onChange={(e) => setAddForm(prev => ({ ...prev, numero: e.target.value }))}
                  placeholder="ex: K001, B001, T001"
                />
              </div>
              
              <div>
                <Label htmlFor="add-description">Description</Label>
                <Textarea
                  id="add-description"
                  value={addForm.description}
                  onChange={(e) => setAddForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de l'équipement"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleAddEquipment} className="flex-1">
                  Ajouter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Modifier l'équipement</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="numero">Référence</Label>
                                <Input
                                  id="numero"
                                  value={editForm.numero}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, numero: e.target.value }))}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                  id="description"
                                  value={editForm.description}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="statut">Statut</Label>
                                <Select value={editForm.statut} onValueChange={(value: StockItem['statut']) => 
                                  setEditForm(prev => ({ ...prev, statut: value }))
                                }>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="disponible">Disponible</SelectItem>
                                    <SelectItem value="attribue">Attribué</SelectItem>
                                    <SelectItem value="perdu">Perdu</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {editForm.statut === 'attribue' && (
                                <div>
                                  <Label htmlFor="clientActuel">Client actuel</Label>
                                  <Input
                                    id="clientActuel"
                                    value={editForm.clientActuel}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, clientActuel: e.target.value }))}
                                    placeholder="Nom du client"
                                  />
                                </div>
                              )}
                              
                              <div className="flex gap-2 pt-4">
                                <Button onClick={handleSaveEdit} className="flex-1">
                                  Sauvegarder
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <DropdownMenuItem onClick={() => setItemToDelete(item.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'équipement</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet équipement ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => itemToDelete && handleDeleteEquipment(itemToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
