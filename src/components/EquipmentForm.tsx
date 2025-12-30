import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useSupabaseStore } from '@/hooks/useSupabaseStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Key, CreditCard, Radio } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const EquipmentForm = ({ onSwitchApp }: { onSwitchApp?: () => void }) => {
  const { clients, addEquipment, buildings, stockItems } = useSupabaseStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Debug logs
  console.log('[EquipmentForm] Component mounted');
  console.log('[EquipmentForm] Clients:', clients?.length || 0);
  console.log('[EquipmentForm] StockItems:', stockItems?.length || 0);
  console.log('[EquipmentForm] Buildings:', buildings?.length || 0);
  
  const [formData, setFormData] = useState({
    clientId: '',
    equipmentType: '' as 'cle' | 'badge' | 'telecommande' | '',
    stockItemId: '', // ID de l'élément sélectionné dans le stock
    batimentId: '',
  });
  
  const [clientOpen, setClientOpen] = useState(false);
  const [equipmentOpen, setEquipmentOpen] = useState(false);
  
  // Fonction pour calculer les quantités réelles basées sur les distributions aux clients
  const getUpdatedStockItem = (stockItem: any) => {
    const distributedCount = clients
      .flatMap(client => client.equipements)
      .filter(eq => 
        eq.type === stockItem.type && 
        eq.numero === stockItem.numero &&
        eq.statut === 'remis'
      ).length;
    
    const lostCount = clients
      .flatMap(client => client.equipements)
      .filter(eq => 
        eq.type === stockItem.type && 
        eq.numero === stockItem.numero &&
        eq.statut === 'perdu'
      ).length;

    const quantiteDisponible = Math.max(0, stockItem.quantite - distributedCount - lostCount);
    
    return {
      ...stockItem,
      quantiteDisponible
    };
  };
  
  // Récupérer les éléments disponibles du stock
  const getAvailableStockItems = () => {
    return stockItems
      .map(item => getUpdatedStockItem(item))
      .filter(item => 
        item.quantiteDisponible > 0 && 
        (!formData.equipmentType || item.type === formData.equipmentType) &&
        (!formData.batimentId || item.batiment_id === formData.batimentId)
      );
  };
  
  const availableItems = getAvailableStockItems();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.equipmentType || !formData.stockItemId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client, un équipement du stock",
        variant: "destructive",
      });
      return;
    }
    
    const selectedItem = availableItems.find(item => item.id === formData.stockItemId);
    if (!selectedItem) {
      toast({
        title: "Erreur",
        description: "Équipement sélectionné non trouvé",
        variant: "destructive",
      });
      return;
    }

    await addEquipment({
      clientId: formData.clientId,
      equipmentType: formData.equipmentType,
      numero: selectedItem.numero,
      description: selectedItem.description,
      batimentId: selectedItem.batiment_id,
    });

    const client = clients.find(c => c.id === formData.clientId);
    
    toast({
      title: "Équipement remis",
      description: `${selectedItem.numero} remis à ${client?.prenom} ${client?.nom}`,
    });
    
    navigate(`/valider-equipement/${formData.clientId}/${clients.find(c => c.id === formData.clientId)?.equipements?.length || 0}`);
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'cle': return <Key className="h-4 w-4" />;
      case 'badge': return <CreditCard className="h-4 w-4" />;
      case 'telecommande': return <Radio className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Remettre équipement</h1>
          <p className="text-sm text-muted-foreground">Attribuer un équipement à un client</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Nouvel équipement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="client">Client *</Label>
              <Popover open={clientOpen} onOpenChange={setClientOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={clientOpen}
                    className="h-12 justify-between"
                  >
                    {formData.clientId
                      ? clients.find((client) => client.id === formData.clientId)?.prenom + " " + clients.find((client) => client.id === formData.clientId)?.nom
                      : "Sélectionner un client"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Rechercher un client..." />
                    <CommandList>
                      <CommandEmpty>Aucun client trouvé.</CommandEmpty>
                      <CommandGroup>
                        {clients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={`${client.prenom} ${client.nom}`}
                            onSelect={() => {
                              setFormData(prev => ({ ...prev, clientId: client.id }));
                              setClientOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.clientId === client.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {client.prenom} {client.nom}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {clients.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Aucun client disponible. 
                  <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/ajouter-client')}>
                    Ajouter un client
                  </Button>
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="equipmentType">Type d'équipement *</Label>
              <Select 
                value={formData.equipmentType} 
                onValueChange={(value: 'cle' | 'badge' | 'telecommande') => 
                  setFormData(prev => ({ ...prev, equipmentType: value, stockItemId: '' }))
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionner le type d'équipement" />
                </SelectTrigger>
                <SelectContent className="z-[100]" position="popper">
                  <SelectItem value="cle">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Clé
                    </div>
                  </SelectItem>
                  <SelectItem value="badge">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Badge
                    </div>
                  </SelectItem>
                  <SelectItem value="telecommande">
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4" />
                      Télécommande
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="batiment">Bâtiment</Label>
              <Select 
                value={formData.batimentId || 'all'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, batimentId: value === 'all' ? '' : value, stockItemId: '' }))}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Filtrer par bâtiment (optionnel)" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] z-[100]" position="popper">
                  <SelectItem value="all">Tous les bâtiments</SelectItem>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.code} - {building.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="equipment">Équipement disponible *</Label>
              <Popover open={equipmentOpen} onOpenChange={setEquipmentOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={equipmentOpen}
                    className="h-12 justify-between"
                    disabled={!formData.equipmentType}
                  >
                    {formData.stockItemId
                      ? availableItems.find((item) => item.id === formData.stockItemId)?.numero + " - " + (availableItems.find((item) => item.id === formData.stockItemId)?.description || 'Sans description')
                      : !formData.equipmentType 
                        ? "Sélectionnez d'abord un type d'équipement" 
                        : availableItems.length === 0 
                          ? "Aucun équipement disponible"
                          : "Sélectionner un équipement du stock"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Rechercher un équipement..." />
                    <CommandList>
                      <CommandEmpty>Aucun équipement trouvé.</CommandEmpty>
                      <CommandGroup>
                        {availableItems.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={`${item.numero} ${item.description || ''}`}
                            onSelect={() => {
                              setFormData(prev => ({ ...prev, stockItemId: item.id }));
                              setEquipmentOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.stockItemId === item.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex items-center justify-between w-full">
                              <span>{item.numero} - {item.description || 'Sans description'}</span>
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {item.quantiteDisponible} dispo
                              </Badge>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {formData.equipmentType && availableItems.length === 0 && (
                <p className="text-sm text-destructive mt-1">
                  Aucun équipement de ce type disponible en stock
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-12"
                onClick={() => navigate('/')}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-12"
                disabled={!formData.clientId || !formData.stockItemId}
              >
                {getEquipmentIcon(formData.equipmentType)}
                <span className="ml-2">Remettre équipement</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};