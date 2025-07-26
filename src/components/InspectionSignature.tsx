import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInspectionStore } from "@/store/useInspectionStore";
import { SignaturePad } from "@/components/SignaturePad";
import { ArrowLeft, FileText, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface InspectionSignatureProps {
  onNavigate: (route: string) => void;
  onBack: () => void;
}

export const InspectionSignature = ({ onNavigate, onBack }: InspectionSignatureProps) => {
  const { currentInspection, setSignature, completeInspection } = useInspectionStore();
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleSignatureSave = (signatureData: string) => {
    setSignature(signatureData);
  };

  const handleCompleteInspection = async () => {
    if (!currentInspection.signature) {
      toast({
        title: "Signature requise",
        description: "Veuillez faire signer le client avant de continuer",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate PDF generation and email sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      completeInspection();
      
      toast({
        title: "État des lieux terminé",
        description: "Le document PDF a été généré et les emails ont été envoyés"
      });
      
      onNavigate('dashboard');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la finalisation",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Signature Client</h1>
            <p className="text-muted-foreground">Finalisation de l'état des lieux</p>
          </div>
        </div>

        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client :</span>
              <span className="font-medium">{currentInspection.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type :</span>
              <span className="font-medium">
                {currentInspection.type === 'entry' ? 'État d\'entrée' : 'État de sortie'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date :</span>
              <span className="font-medium">
                {new Date(currentInspection.date).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Signature */}
        <Card>
          <CardHeader>
            <CardTitle>Signature du Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Veuillez demander au client de signer ci-dessous pour valider l'état des lieux.
              </p>
              <SignaturePad onSignatureChange={handleSignatureSave} />
              {currentInspection.signature && (
                <div className="text-center">
                  <p className="text-sm text-success">✓ Signature enregistrée</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            onClick={handleCompleteInspection}
            disabled={!currentInspection.signature || isProcessing}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isProcessing ? (
              "Génération en cours..."
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Générer PDF et Envoyer
              </>
            )}
          </Button>

          <div className="text-xs text-center text-muted-foreground">
            Le document PDF sera automatiquement envoyé par email<br />
            au client et au gestionnaire de l'espace
          </div>
        </div>

        {/* Warning */}
        <Card className="border-warning">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-warning">
              <p className="font-medium">⚠️ Fonctionnalité en développement</p>
              <p className="mt-1">
                L'envoi automatique d'emails nécessite l'intégration Supabase
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};