import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseStore } from "@/hooks/useSupabaseStore";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useEffect } from "react";

interface InspectionHistoryProps {
  onNavigate: (route: string) => void;
  onBack: () => void;
  onSwitchApp?: () => void;
}

export const InspectionHistory = ({ onNavigate, onBack, onSwitchApp }: InspectionHistoryProps) => {
  const { inspections, buildings, syncFromSupabase } = useSupabaseStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBuilding, setFilterBuilding] = useState<string>('all');

  // Synchroniser les données au chargement du composant
  useEffect(() => {
    syncFromSupabase();
  }, [syncFromSupabase]);

  const filteredInspections = inspections
    .filter(inspection => {
      const matchesSearch = inspection.client_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || inspection.type === filterType;
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'completed' && inspection.completed) ||
        (filterStatus === 'pending' && !inspection.completed);
      const matchesBuilding = filterBuilding === 'all' || inspection.building_code === filterBuilding;
      return matchesSearch && matchesType && matchesStatus && matchesBuilding;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="outline" size="icon" onClick={onBack} className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-foreground">Historique des États des Lieux</h1>
              <p className="text-sm text-muted-foreground">Tous les états des lieux enregistrés</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={syncFromSupabase} className="w-full sm:w-auto">
              Actualiser
            </Button>
            {onSwitchApp && (
              <Button variant="outline" onClick={onSwitchApp} className="w-full sm:w-auto">
                Gestion Équipements
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom de client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type d'état des lieux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="entry">Entrée</SelectItem>
                  <SelectItem value="exit">Sortie</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBuilding} onValueChange={setFilterBuilding}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par bâtiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les bâtiments</SelectItem>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={building.code}>
                      {building.code} - {building.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredInspections.length} état{filteredInspections.length > 1 ? 's' : ''} des lieux trouvé{filteredInspections.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Inspections List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredInspections.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Aucun état des lieux trouvé</p>
              </CardContent>
            </Card>
          ) : (
            filteredInspections.map((inspection) => (
              <Card key={inspection.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base sm:text-lg truncate">{inspection.client_name}</h3>
                        <Badge variant={inspection.type === 'entry' ? 'default' : 'secondary'} className="text-xs">
                          {inspection.type === 'entry' ? 'Entrée' : 'Sortie'}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                        <p>
                          Date: {format(new Date(inspection.date), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        </p>
                        <p className="truncate">Email: {inspection.client_email}</p>
                        {inspection.building_code && (
                          <p>Bâtiment: {inspection.building_code}</p>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-full sm:w-auto mt-2 sm:mt-0"
                      onClick={() => onNavigate(`inspection-detail/${inspection.id}`)}
                    >
                      Voir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};