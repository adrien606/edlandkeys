import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseStore } from '@/hooks/useSupabaseStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ClientForm = ({ onSwitchApp }: { onSwitchApp?: () => void }) => {
  const { addClient, buildings } = useSupabaseStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    telephone_secondaire: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Tentative d\'ajout de client:', formData);
    
    if (!formData.nom || !formData.prenom) {
      console.log('Validation échouée: nom ou prénom manquant');
      toast({
        title: "Erreur",
        description: "Le nom et prénom sont obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Appel à addClient...');
      await addClient(formData);
      console.log('Client ajouté avec succès');
      
      toast({
        title: "Client ajouté",
        description: `${formData.prenom} ${formData.nom} a été ajouté avec succès`,
      });
      
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du client:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'ajouter le client",
        variant: "destructive",
      });
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
          <h1 className="text-xl font-bold">Nouveau client</h1>
          <p className="text-sm text-muted-foreground">Ajouter un nouveau client</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Informations client
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="nom">Nom de l'entreprise *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  placeholder="Nom de l'entreprise"
                  className="h-12"
                />
              </div>

              <div>
                <Label htmlFor="prenom">Contact *</Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => handleChange('prenom', e.target.value)}
                  placeholder="Nom du contact"
                  className="h-12"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@exemple.com"
                  className="h-12"
                />
              </div>

              <div>
                <Label htmlFor="telephone">Téléphone principal</Label>
                <Input
                  id="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => handleChange('telephone', e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="h-12"
                />
              </div>

              <div>
                <Label htmlFor="telephone_secondaire">Téléphone secondaire (optionnel)</Label>
                <Input
                  id="telephone_secondaire"
                  type="tel"
                  value={formData.telephone_secondaire}
                  onChange={(e) => handleChange('telephone_secondaire', e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Pour un collaborateur récupérant les colis
                </p>
              </div>

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
              >
                Ajouter client
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};