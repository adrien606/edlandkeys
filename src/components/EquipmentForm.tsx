import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Key, CreditCard, Radio } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const EquipmentForm = ({ onSwitchApp }: { onSwitchApp?: () => void }) => {
  const { clients, addEquipment, buildings } = useStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    clientId: '',
    equipmentType: '' as 'cle' | 'badge' | 'telecommande' | '',
    numero: '',
    description: '',
    batimentId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.equipmentType || !formData.batimentId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client, un type d'équipement et un bâtiment",
        variant: "destructive",
      });
      return;
    }

    addEquipment({
      clientId: formData.clientId,
      equipmentType: formData.equipmentType,
      numero: formData.numero,
      description: formData.description,
      batimentId: formData.batimentId,
    });

    const client = clients.find(c => c.id === formData.clientId);
    
    toast({
      title: "Équipement remis",
      description: `${formData.equipmentType} remis à ${client?.prenom} ${client?.nom}`,
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
              <Select value={formData.clientId} onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.prenom} {client.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  setFormData(prev => ({ ...prev, equipmentType: value }))
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionner le type d'équipement" />
                </SelectTrigger>
                <SelectContent>
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
              <Label htmlFor="batiment">Bâtiment *</Label>
              <Select 
                value={formData.batimentId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, batimentId: value }))}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionner un bâtiment" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.code} - {building.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="numero">Numéro/Référence</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                placeholder="ex: K001, B123..."
                className="h-12"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description optionnelle de l'équipement"
                className="min-h-20"
              />
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
                disabled={!formData.clientId || !formData.equipmentType || !formData.batimentId}
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