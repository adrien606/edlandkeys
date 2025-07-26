import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";
import { useInspectionStore } from "@/store/useInspectionStore";
import { ArrowLeft, Home, LogOut, Building, Settings } from "lucide-react";

interface NewInspectionProps {
  onNavigate: (route: string) => void;
  onBack: () => void;
  onSwitchApp?: () => void;
}

export const NewInspection = ({ onNavigate, onBack, onSwitchApp }: NewInspectionProps) => {
  const { clients } = useStore();
  const { createInspection, inspectionBuildings } = useInspectionStore();
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [inspectionType, setInspectionType] = useState<'entry' | 'exit'>('entry');

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedBuilding = inspectionBuildings.find(b => b.id === selectedBuildingId);

  const handleStartInspection = () => {
    if (!selectedClient) return;
    
    createInspection(
      selectedClient.id,
      `${selectedClient.prenom} ${selectedClient.nom}`,
      selectedClient.email,
      inspectionType,
      selectedBuildingId || undefined,
      undefined // Pas d'inspection d'entrée pour les nouvelles inspections
    );
    
    onNavigate('inspection-form');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nouvel État des Lieux</h1>
            <p className="text-muted-foreground">Sélectionnez un client et le type</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Type d'État des Lieux</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={inspectionType === 'entry' ? 'default' : 'outline'}
                className="h-20 flex flex-col gap-2"
                onClick={() => setInspectionType('entry')}
              >
                <Home className="w-6 h-6" />
                <span>Entrée</span>
              </Button>
              <Button
                variant={inspectionType === 'exit' ? 'default' : 'outline'}
                className="h-20 flex flex-col gap-2"
                onClick={() => setInspectionType('exit')}
              >
                <LogOut className="w-6 h-6" />
                <span>Sortie</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sélectionner un Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un client..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{client.prenom} {client.nom}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedClient && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    {selectedClient.prenom} {selectedClient.nom}
                  </span>
                  <Badge variant="outline">Client</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedClient.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedClient.telephone}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sélectionner un Bâtiment</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigate('building-management')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Gérer
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedBuildingId} onValueChange={setSelectedBuildingId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un bâtiment (optionnel)..." />
              </SelectTrigger>
              <SelectContent>
                {inspectionBuildings.map((building) => (
                  <SelectItem key={building.id} value={building.id}>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <span>{building.code} - {building.nom}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedBuilding && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    {selectedBuilding.nom}
                  </span>
                  <Badge variant="outline">{selectedBuilding.code}</Badge>
                </div>
                {selectedBuilding.adresse && (
                  <p className="text-sm text-muted-foreground">
                    📍 {selectedBuilding.adresse}
                  </p>
                )}
                {selectedBuilding.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedBuilding.description}
                  </p>
                )}
              </div>
            )}

            {inspectionBuildings.length === 0 && (
              <div className="text-center text-muted-foreground p-4 border border-dashed rounded-lg">
                <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun bâtiment enregistré</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => onNavigate('building-management')}
                >
                  Ajouter un bâtiment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Button 
          onClick={handleStartInspection}
          disabled={!selectedClientId}
          className="w-full h-12 text-lg"
          size="lg"
        >
          Commencer l'État des Lieux
        </Button>

        {clients.length === 0 && (
          <div className="text-center text-muted-foreground p-8">
            <p>Aucun client enregistré.</p>
            <p className="text-sm mt-2">
              Utilisez l'application "Gestion Équipements" pour ajouter des clients.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};