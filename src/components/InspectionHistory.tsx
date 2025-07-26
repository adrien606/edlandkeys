import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInspectionStore } from "@/store/useInspectionStore";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";

interface InspectionHistoryProps {
  onNavigate: (route: string) => void;
  onBack: () => void;
  onSwitchApp?: () => void;
}

export const InspectionHistory = ({ onNavigate, onBack, onSwitchApp }: InspectionHistoryProps) => {
  const { inspections } = useInspectionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredInspections = inspections
    .filter(inspection => {
      const matchesSearch = inspection.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || inspection.type === filterType;
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'completed' && inspection.completed) ||
        (filterStatus === 'pending' && !inspection.completed);
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
              <h1 className="text-3xl font-bold text-foreground">Historique des États des Lieux</h1>
              <p className="text-muted-foreground">Tous les états des lieux enregistrés</p>
            </div>
          </div>
          {onSwitchApp && (
            <Button variant="outline" onClick={onSwitchApp}>
              Gestion Équipements
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="pending">En cours</SelectItem>
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
        <div className="space-y-4">
          {filteredInspections.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Aucun état des lieux trouvé</p>
              </CardContent>
            </Card>
          ) : (
            filteredInspections.map((inspection) => (
              <Card key={inspection.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{inspection.clientName}</h3>
                        <Badge variant={inspection.type === 'entry' ? 'default' : 'secondary'}>
                          {inspection.type === 'entry' ? 'Entrée' : 'Sortie'}
                        </Badge>
                        <Badge 
                          variant={inspection.completed ? 'outline' : 'destructive'}
                          className={inspection.completed ? 'text-success border-success' : ''}
                        >
                          {inspection.completed ? 'Terminé' : 'En cours'}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          Date: {format(new Date(inspection.date), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        </p>
                        <p>Email: {inspection.clientEmail}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
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