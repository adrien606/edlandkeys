import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseStore } from '@/hooks/useSupabaseStore';
import { Building, Plus } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export const BuildingSelector = () => {
  const { buildings, currentBuildingId, setCurrentBuilding, addBuilding } = useSupabaseStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    description: '',
  });

  const currentBuilding = buildings.find(b => b.id === currentBuildingId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom.trim() || !formData.code.trim()) {
      toast.error('Nom et code du bâtiment obligatoires');
      return;
    }

    // Vérifier si le code existe déjà
    if (buildings.some(b => b.code.toLowerCase() === formData.code.toLowerCase())) {
      toast.error('Ce code de bâtiment existe déjà');
      return;
    }

    await addBuilding(formData);
    setFormData({ nom: '', code: '', description: '' });
    setIsDialogOpen(false);
    toast.success('Bâtiment ajouté avec succès');
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          Sélection du bâtiment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={currentBuildingId || 'all'} onValueChange={(value) => setCurrentBuilding(value === 'all' ? null : value)}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Sélectionner un bâtiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les bâtiments</SelectItem>
              {buildings.map((building) => (
                <SelectItem key={building.id} value={building.id}>
                  {building.code} - {building.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau bâtiment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="code">Code du bâtiment *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="ex: BAI, BAS..."
                    maxLength={10}
                    className="uppercase"
                  />
                </div>
                <div>
                  <Label htmlFor="nom">Nom du bâtiment *</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="ex: Bâtiment principal"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description du bâtiment..."
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1">
                    Ajouter
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {currentBuilding && (
          <div className="p-3 bg-primary/10 rounded-lg">
            <div className="font-medium text-primary">{currentBuilding.code} - {currentBuilding.nom}</div>
            {currentBuilding.description && (
              <div className="text-sm text-muted-foreground mt-1">{currentBuilding.description}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};