import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { SignaturePad } from '@/components/SignaturePad';
import { useStore } from '@/store/useStore';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Key, CreditCard, Radio } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const EquipmentValidation = ({ onSwitchApp }: { onSwitchApp?: () => void }) => {
  const { clientId, equipmentIndex } = useParams();
  const { getClientById, validateEquipment } = useStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [nomClient, setNomClient] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  
  const client = clientId ? getClientById(clientId) : null;
  const equipment = client?.equipements[parseInt(equipmentIndex || '0') - 1];

  useEffect(() => {
    if (client) {
      setNomClient(`${client.prenom} ${client.nom}`);
    }
  }, [client]);

  const handleValidation = () => {
    if (!clientId || !equipment || !nomClient.trim() || !isConfirmed || !signature) {
      toast({
        title: "Erreur",
        description: "Veuillez compléter tous les champs, signer et confirmer la réception",
        variant: "destructive",
      });
      return;
    }

    validateEquipment(clientId, equipment.id, nomClient, signature);
    
    toast({
      title: "Validation confirmée",
      description: "L'équipement a été validé par le client",
    });
    
    navigate('/');
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'cle': return <Key className="h-5 w-5 text-primary" />;
      case 'badge': return <CreditCard className="h-5 w-5 text-primary" />;
      case 'telecommande': return <Radio className="h-5 w-5 text-primary" />;
      default: return null;
    }
  };

  const getEquipmentLabel = (type: string) => {
    switch (type) {
      case 'cle': return 'Clé';
      case 'badge': return 'Badge';
      case 'telecommande': return 'Télécommande';
      default: return type;
    }
  };

  if (!client || !equipment) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Client ou équipement introuvable</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Validation client</h1>
          <p className="text-sm text-muted-foreground">Confirmation de réception d'équipement</p>
        </div>
      </div>

      {/* Equipment Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {getEquipmentIcon(equipment.type)}
            <div>
              <div className="text-lg">{getEquipmentLabel(equipment.type)}</div>
              {equipment.numero && (
                <div className="text-sm text-muted-foreground font-normal">
                  Référence: {equipment.numero}
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Client:</span>
              <p className="font-medium">{client.prenom} {client.nom}</p>
            </div>
            {equipment.description && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Description:</span>
                <p className="text-sm">{equipment.description}</p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-muted-foreground">Date de remise:</span>
              <p className="text-sm">
                {new Date(equipment.dateRemise!).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Validation par le client
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nomClient">Nom du client (saisie manuelle) *</Label>
            <Input
              id="nomClient"
              value={nomClient}
              onChange={(e) => setNomClient(e.target.value)}
              placeholder="Saisir le nom complet du client"
              className="h-12"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Le client doit saisir son nom pour confirmer la réception
            </p>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
            <Checkbox
              id="confirmation"
              checked={isConfirmed}
              onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
              className="mt-1"
            />
            <div className="space-y-1">
              <Label
                htmlFor="confirmation"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Je confirme avoir reçu l'équipement décrit ci-dessus
              </Label>
              <p className="text-xs text-muted-foreground">
                Le client doit cocher cette case pour valider la réception
              </p>
            </div>
          </div>

          {/* Signature */}
          <SignaturePad 
            onSignatureChange={setSignature}
            className="mt-4"
          />

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1 h-12"
              onClick={() => navigate('/')}
            >
              Annuler
            </Button>
            <Button 
              className="flex-1 h-12"
              onClick={handleValidation}
              disabled={!nomClient.trim() || !isConfirmed || !signature}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Valider avec signature
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Présentez cet écran au client</li>
              <li>Demandez-lui de saisir son nom complet</li>
              <li>Demandez-lui de signer dans la zone prévue</li>
              <li>Demandez-lui de cocher la case de confirmation</li>
              <li>Validez la réception une fois tous les champs complétés</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};