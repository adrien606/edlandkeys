import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInspectionStore } from "@/store/useInspectionStore";
import { ArrowLeft, Download, Mail, Eye, User, Calendar, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { INSPECTION_AREAS } from "@/types/inspection";

interface InspectionDetailProps {
  inspectionId: string;
  onNavigate: (route: string) => void;
  onBack: () => void;
  onSwitchApp?: () => void;
}

export const InspectionDetail = ({ inspectionId, onNavigate, onBack, onSwitchApp }: InspectionDetailProps) => {
  const { inspections } = useInspectionStore();
  
  const inspection = inspections.find(i => i.id === inspectionId);

  if (!inspection) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">État des lieux introuvable</p>
              <Button onClick={onBack} className="mt-4">
                Retour
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'damaged':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'missing':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'needs_attention':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'good':
        return 'Bon état';
      case 'damaged':
        return 'Endommagé';
      case 'missing':
        return 'Manquant';
      case 'needs_attention':
        return 'Attention requise';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-success text-success-foreground';
      case 'damaged':
        return 'bg-warning text-warning-foreground';
      case 'missing':
        return 'bg-destructive text-destructive-foreground';
      case 'needs_attention':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
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
              <h1 className="text-3xl font-bold text-foreground">Détail de l'État des Lieux</h1>
              <p className="text-muted-foreground">{inspection.clientName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {onSwitchApp && (
              <Button variant="outline" onClick={onSwitchApp}>
                Gestion Équipements
              </Button>
            )}
          </div>
        </div>

        {/* Inspection Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Client</p>
                <p className="text-lg">{inspection.clientName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg">{inspection.clientEmail}</p>
              </div>
              {inspection.buildingCode && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bâtiment</p>
                  <p className="text-lg">{inspection.buildingCode}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <Badge variant={inspection.type === 'entry' ? 'default' : 'secondary'}>
                  {inspection.type === 'entry' ? 'État d\'entrée' : 'État de sortie'}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(inspection.date), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Statut</p>
                <Badge 
                  variant={inspection.completed ? 'outline' : 'destructive'}
                  className={inspection.completed ? 'text-success border-success' : ''}
                >
                  {inspection.completed ? 'Terminé' : 'En cours'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inspection Items */}
        <Card>
          <CardHeader>
            <CardTitle>Éléments inspectés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {INSPECTION_AREAS.map((area) => {
                const item = inspection.items[area.key as keyof typeof inspection.items];
                return (
                  <Card key={area.key} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-lg">{area.label}</h3>
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1">{getStatusLabel(item.status)}</span>
                        </Badge>
                      </div>
                      
                      {item.comment && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Commentaire:</p>
                          <p className="text-sm bg-background p-2 rounded">{item.comment}</p>
                        </div>
                      )}

                      {item.photos && item.photos.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            Photos ({item.photos.length})
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {item.photos.map((photo, index) => (
                              <div key={index} className="aspect-square bg-muted rounded overflow-hidden">
                                <img 
                                  src={photo} 
                                  alt={`Photo ${index + 1} - ${area.label}`}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                  onClick={() => {
                                    // Could open a modal or fullscreen view
                                    window.open(photo, '_blank');
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Signature */}
        {inspection.signature && (
          <Card>
            <CardHeader>
              <CardTitle>Signature du client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded p-4 bg-white">
                <img 
                  src={inspection.signature} 
                  alt="Signature du client"
                  className="max-w-full h-auto"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-12">
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </Button>
              
              <Button variant="outline" className="h-12">
                <Mail className="w-4 h-4 mr-2" />
                Envoyer par email
              </Button>
              
              <Button variant="outline" className="h-12">
                <Eye className="w-4 h-4 mr-2" />
                Aperçu PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};