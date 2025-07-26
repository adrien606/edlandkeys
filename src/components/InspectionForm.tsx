import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useInspectionStore } from "@/store/useInspectionStore";
import { INSPECTION_AREAS } from "@/types/inspection";
import { ArrowLeft, Camera, X, Check, AlertTriangle, XCircle, FileSearch } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface InspectionFormProps {
  onNavigate: (route: string) => void;
  onBack: () => void;
  onSwitchApp?: () => void;
}

export const InspectionForm = ({ onNavigate, onBack, onSwitchApp }: InspectionFormProps) => {
  const { currentInspection, updateInspectionItem, addPhotoToItem, removePhotoFromItem } = useInspectionStore();
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentInspection) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Aucun état des lieux en cours</p>
          <Button onClick={onBack} className="mt-4">Retour</Button>
        </div>
      </div>
    );
  }

  const currentArea = INSPECTION_AREAS[currentAreaIndex];
  const currentItem = currentInspection.items[currentArea.key as keyof typeof currentInspection.items];

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      addPhotoToItem(currentArea.key as keyof typeof currentInspection.items, result);
      toast({
        title: "Photo ajoutée",
        description: "La photo a été ajoutée avec succès"
      });
    };
    reader.readAsDataURL(file);
  };

  const handleNextArea = () => {
    if (currentAreaIndex < INSPECTION_AREAS.length - 1) {
      setCurrentAreaIndex(currentAreaIndex + 1);
    } else {
      onNavigate('inspection-signature');
    }
  };

  const handlePreviousArea = () => {
    if (currentAreaIndex > 0) {
      setCurrentAreaIndex(currentAreaIndex - 1);
    }
  };

  const statusOptions = [
    { value: 'good', label: 'Bon état', icon: Check, color: 'text-success' },
    { value: 'needs_attention', label: 'À surveiller', icon: AlertTriangle, color: 'text-warning' },
    { value: 'damaged', label: 'Endommagé', icon: XCircle, color: 'text-destructive' },
    { value: 'missing', label: 'Manquant', icon: FileSearch, color: 'text-muted-foreground' }
  ] as const;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{currentInspection.clientName}</h1>
            <div className="flex items-center gap-2">
              <Badge variant={currentInspection.type === 'entry' ? 'default' : 'secondary'}>
                {currentInspection.type === 'entry' ? 'Entrée' : 'Sortie'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {currentAreaIndex + 1}/{INSPECTION_AREAS.length}
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentAreaIndex + 1) / INSPECTION_AREAS.length) * 100}%` }}
          />
        </div>

        {/* Current Area */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{currentArea.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">État de l'élément</label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.value}
                      variant={currentItem.status === option.value ? 'default' : 'outline'}
                      className="h-auto p-3 flex flex-col gap-2"
                      onClick={() => updateInspectionItem(currentArea.key as keyof typeof currentInspection.items, { status: option.value })}
                    >
                      <Icon className={`w-5 h-5 ${currentItem.status === option.value ? 'text-primary-foreground' : option.color}`} />
                      <span className="text-xs">{option.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Observations</label>
              <Textarea
                placeholder="Commentaires sur l'état de cet élément..."
                value={currentItem.comment}
                onChange={(e) => updateInspectionItem(currentArea.key as keyof typeof currentInspection.items, { comment: e.target.value })}
                rows={3}
              />
            </div>

            {/* Photos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Photos</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoCapture}
              />

              {currentItem.photos.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {currentItem.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removePhotoFromItem(currentArea.key as keyof typeof currentInspection.items, index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {currentItem.photos.length === 0 && (
                <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                  <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune photo ajoutée</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handlePreviousArea}
            disabled={currentAreaIndex === 0}
            className="flex-1"
          >
            Précédent
          </Button>
          <Button 
            onClick={handleNextArea}
            className="flex-1"
          >
            {currentAreaIndex === INSPECTION_AREAS.length - 1 ? 'Terminer' : 'Suivant'}
          </Button>
        </div>
      </div>
    </div>
  );
};