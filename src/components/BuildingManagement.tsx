import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useStore } from '@/store/useStore';
import { ArrowLeft, Plus, Building, Edit3, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface BuildingManagementProps {
  onNavigate: (route: string) => void;
  onBack: () => void;
  onSwitchApp?: () => void;
}

export const BuildingManagement = ({ onNavigate, onBack, onSwitchApp }: BuildingManagementProps) => {
  const { 
    buildings: inspectionBuildings, 
    addBuilding: addInspectionBuilding, 
    updateBuilding: updateInspectionBuilding, 
    deleteBuilding: deleteInspectionBuilding 
  } = useStore();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<any>(null);
  const [buildingToDelete, setBuildingToDelete] = useState<string | null>(null);
  
  const [buildingForm, setBuildingForm] = useState({
    nom: '',
    code: '',
    description: ''
  });

  const handleAddBuilding = () => {
    if (!buildingForm.nom.trim() || !buildingForm.code.trim()) {
      toast.error('Le nom et le code sont obligatoires');
      return;
    }

    addInspectionBuilding({
      nom: buildingForm.nom,
      code: buildingForm.code,
      description: buildingForm.description
    });

    setBuildingForm({ nom: '', code: '', description: '' });
    setIsAddDialogOpen(false);
    toast.success('Bâtiment ajouté avec succès');
  };

  const handleEditBuilding = (building: any) => {
    setEditingBuilding(building);
    setBuildingForm({
      nom: building.nom,
      code: building.code,
      description: building.description || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingBuilding) return;

    updateInspectionBuilding(editingBuilding.id, {
      nom: buildingForm.nom,
      code: buildingForm.code,
      description: buildingForm.description
    });

    setEditingBuilding(null);
    setBuildingForm({ nom: '', code: '', description: '' });
    setIsEditDialogOpen(false);
    toast.success('Bâtiment modifié avec succès');
  };

  const handleDeleteBuilding = (buildingId: string) => {
    deleteInspectionBuilding(buildingId);
    setBuildingToDelete(null);
    toast.success('Bâtiment supprimé avec succès');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestion des Bâtiments</h1>
              <p className="text-muted-foreground">États des lieux</p>
            </div>
          </div>
          <div className="flex gap-2">
            {onSwitchApp && (
              <Button variant="outline" onClick={onSwitchApp}>
                Gestion Équipements
              </Button>
            )}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Bâtiment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un bâtiment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nom">Nom du bâtiment *</Label>
                    <Input
                      id="nom"
                      value={buildingForm.nom}
                      onChange={(e) => setBuildingForm(prev => ({ ...prev, nom: e.target.value }))}
                      placeholder="ex: Bâtiment A"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      value={buildingForm.code}
                      onChange={(e) => setBuildingForm(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="ex: BAT-A"
                    />
                  </div>
                  
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={buildingForm.description}
                      onChange={(e) => setBuildingForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description du bâtiment"
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                      Annuler
                    </Button>
                    <Button onClick={handleAddBuilding} className="flex-1">
                      Ajouter
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Buildings List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inspectionBuildings.map((building) => (
            <Card key={building.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4" />
                      <h3 className="font-semibold">{building.nom}</h3>
                      <Badge variant="outline">{building.code}</Badge>
                    </div>
                    
                    
                    {building.description && (
                      <p className="text-sm text-muted-foreground">{building.description}</p>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Créé le {new Date(building.dateCreation).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => handleEditBuilding(building)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={() => setBuildingToDelete(building.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {inspectionBuildings.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Aucun bâtiment enregistré</p>
            </CardContent>
          </Card>
        )}

        {/* Edit Building Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le bâtiment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-nom">Nom du bâtiment *</Label>
                <Input
                  id="edit-nom"
                  value={buildingForm.nom}
                  onChange={(e) => setBuildingForm(prev => ({ ...prev, nom: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-code">Code *</Label>
                <Input
                  id="edit-code"
                  value={buildingForm.code}
                  onChange={(e) => setBuildingForm(prev => ({ ...prev, code: e.target.value }))}
                />
              </div>
              
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={buildingForm.description}
                  onChange={(e) => setBuildingForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleSaveEdit} className="flex-1">
                  Sauvegarder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!buildingToDelete} onOpenChange={() => setBuildingToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le bâtiment</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer ce bâtiment ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => buildingToDelete && handleDeleteBuilding(buildingToDelete)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};