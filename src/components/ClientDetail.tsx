import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useStore } from '@/store/useStore';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Key, CreditCard, Radio, User, Mail, Phone, Calendar, CheckCircle2, XCircle, AlertTriangle, Clock, Edit3, Trash2, MoreVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EditClientDialog, DeleteClientDialog } from '@/components/EditClientDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export const ClientDetail = ({ onSwitchApp }: { onSwitchApp?: () => void }) => {
  const { clientId } = useParams();
  const { getClientById, updateEquipmentStatus, deleteClient, deleteEquipment, buildings } = useStore();
  const navigate = useNavigate();
  const { toast: useToastHook } = useToast();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(null);
  
  const client = clientId ? getClientById(clientId) : null;
  // Le bâtiment est maintenant associé aux équipements, pas au client

  const handleStatusChange = (equipmentId: string, newStatus: string) => {
    if (!clientId) return;
    
    updateEquipmentStatus(
      clientId, 
      equipmentId, 
      newStatus as any,
      newStatus === 'restitue' ? new Date().toISOString() : undefined
    );
    
    useToastHook({
      title: "Statut mis à jour",
      description: `L'équipement a été marqué comme ${getStatusLabel(newStatus)}`,
    });
  };

  const handleDeleteClient = () => {
    if (!clientId) return;
    
    deleteClient(clientId);
    toast.success('Client supprimé avec succès');
    navigate('/clients');
  };

  const handleDeleteEquipment = (equipmentId: string) => {
    if (!clientId) return;
    
    deleteEquipment(clientId, equipmentId);
    toast.success('Équipement supprimé avec succès');
    setEquipmentToDelete(null);
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'cle': return <Key className="h-4 w-4" />;
      case 'badge': return <CreditCard className="h-4 w-4" />;
      case 'telecommande': return <Radio className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'remis': return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'restitue': return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'perdu': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'non_rendu': return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'remis': return 'bg-success text-success-foreground';
      case 'restitue': return 'bg-muted text-muted-foreground';
      case 'perdu': return 'bg-destructive text-destructive-foreground';
      case 'non_rendu': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'remis': return 'Remis';
      case 'restitue': return 'Restitué';
      case 'perdu': return 'Perdu';
      case 'non_rendu': return 'Non rendu';
      default: return status;
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

  if (!client) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Client introuvable</p>
            <Button onClick={() => navigate('/clients')} className="mt-4">
              Retour à la liste
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{client.prenom} {client.nom}</h1>
          <p className="text-sm text-muted-foreground">Détails du client</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit3 className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Client Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations client
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            {client.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{client.email}</span>
              </div>
            )}
            {client.telephone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{client.telephone}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Inscrit le {new Date(client.dateInscription).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Équipements ({client.equipements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {client.equipements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun équipement attribué</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/remettre-equipement')}
              >
                Attribuer un équipement
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {client.equipements.map((equipment) => (
                <Card key={equipment.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Equipment Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getEquipmentIcon(equipment.type)}
                          <div>
                            <div className="font-medium">
                              {getEquipmentLabel(equipment.type)}
                              {equipment.numero && (
                                <span className="text-muted-foreground ml-2">
                                  #{equipment.numero}
                                </span>
                              )}
                            </div>
                            {equipment.description && (
                              <p className="text-sm text-muted-foreground">
                                {equipment.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Bâtiment: {buildings.find(b => b.id === equipment.batimentId)?.code || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(equipment.statut)}>
                            {getStatusIcon(equipment.statut)}
                            <span className="ml-1">{getStatusLabel(equipment.statut)}</span>
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => setEquipmentToDelete(equipment.id)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Equipment Details */}
                      <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Remis le:</span>{' '}
                          {new Date(equipment.dateRemise!).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        
                        {equipment.dateRestitution && (
                          <div>
                            <span className="font-medium">Restitué le:</span>{' '}
                            {new Date(equipment.dateRestitution).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}

                        {equipment.validationClient && (
                          <div className="p-2 bg-success/10 rounded border-l-4 border-success">
                            <div className="text-success font-medium text-xs">
                              ✓ Validé par: {equipment.validationClient.nomClient}
                            </div>
                            <div className="text-xs">
                              Le {new Date(equipment.validationClient.dateValidation).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Status Change */}
                      <div className="pt-2 border-t">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Modifier le statut:
                        </Label>
                        <Select
                          value={equipment.statut}
                          onValueChange={(value) => handleStatusChange(equipment.id, value)}
                        >
                          <SelectTrigger className="h-9 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="remis">Remis</SelectItem>
                            <SelectItem value="restitue">Restitué</SelectItem>
                            <SelectItem value="perdu">Perdu</SelectItem>
                            <SelectItem value="non_rendu">Non rendu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-3">
        <Button 
          onClick={() => navigate('/remettre-equipement')}
          className="h-12"
        >
          <Key className="mr-2 h-4 w-4" />
          Attribuer un nouvel équipement
        </Button>
      </div>

      {/* Edit Client Dialog */}
      <EditClientDialog 
        isOpen={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)} 
        client={client} 
      />

      {/* Delete Client Dialog */}
      <DeleteClientDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)} 
        client={client}
        onDelete={handleDeleteClient}
      />

      {/* Delete Equipment Dialog */}
      <AlertDialog open={!!equipmentToDelete} onOpenChange={() => setEquipmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'équipement</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet équipement ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => equipmentToDelete && handleDeleteEquipment(equipmentToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};