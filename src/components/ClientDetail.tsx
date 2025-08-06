import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useSupabaseStore } from '@/hooks/useSupabaseStore';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Key, CreditCard, Radio, User, Mail, Phone, Calendar, CheckCircle2, XCircle, AlertTriangle, Clock, Edit3, Trash2, MoreVertical, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EditClientDialog, DeleteClientDialog } from '@/components/EditClientDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export const ClientDetail = ({ onSwitchApp }: { onSwitchApp?: () => void }) => {
  const { clientId } = useParams();
  const { getClientById, updateEquipmentStatus, deleteClient, deleteEquipment, buildings, stockItems } = useSupabaseStore();
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

  // Fonction pour vérifier si l'équipement existe dans le stock
  const isEquipmentMissingFromStock = (equipment: any) => {
    return !stockItems.some(stockItem => 
      stockItem.type === equipment.type && 
      stockItem.numero === equipment.numero
    );
  };

  // Génération du contenu PDF pour les équipements du client
  const generateEquipmentPDFContent = () => {
    const building = client.equipements.length > 0 
      ? buildings.find(b => b.id === client.equipements[0]?.batimentId)
      : null;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Fiche Équipements - ${client.nom}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .client-info { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
          .equipment-list { margin-bottom: 30px; }
          .equipment-item { border: 1px solid #ddd; margin-bottom: 15px; padding: 15px; border-radius: 5px; }
          .equipment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
          .status-badge { padding: 5px 10px; border-radius: 3px; font-size: 12px; font-weight: bold; }
          .status-remis { background: #d4edda; color: #155724; }
          .status-restitue { background: #f8f9fa; color: #6c757d; }
          .status-perdu { background: #f8d7da; color: #721c24; }
          .status-non_rendu { background: #fff3cd; color: #856404; }
          .validation { background: #d4edda; padding: 15px; margin-top: 10px; border-left: 4px solid #28a745; }
          .signature-client { margin-top: 15px; text-align: center; }
          .signature-client img { max-width: 300px; max-height: 150px; border: 2px solid #28a745; border-radius: 5px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
          @media print { 
            body { margin: 0; } 
            .header { page-break-after: avoid; }
            .equipment-item { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FICHE ÉQUIPEMENTS</h1>
          <h2>${client.nom}</h2>
          <p>Date de génération : ${new Date().toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>

        <div class="client-info">
          <h3>Informations Client</h3>
          <p><strong>Entreprise :</strong> ${client.nom}</p>
          <p><strong>Contact :</strong> ${client.prenom}</p>
          <p><strong>Email :</strong> ${client.email}</p>
          <p><strong>Téléphone :</strong> ${client.telephone}</p>
          <p><strong>Date d'inscription :</strong> ${new Date(client.dateInscription).toLocaleDateString('fr-FR')}</p>
          ${building ? `<p><strong>Bâtiment principal :</strong> ${building.code} - ${building.nom}</p>` : ''}
        </div>

        <div class="equipment-list">
          <h3>Liste des Équipements (${client.equipements.length})</h3>
          ${client.equipements.map(equipment => {
            const equipmentBuilding = buildings.find(b => b.id === equipment.batimentId);
            return `
              <div class="equipment-item">
                <div class="equipment-header">
                  <div>
                    <h4>${getEquipmentLabel(equipment.type)} ${equipment.numero ? `#${equipment.numero}` : ''}</h4>
                    ${equipment.description ? `<p style="color: #666; margin: 5px 0;">${equipment.description}</p>` : ''}
                    <p style="font-size: 14px; color: #666;">Bâtiment: ${equipmentBuilding?.code || 'N/A'}</p>
                  </div>
                  <span class="status-badge status-${equipment.statut}">
                    ${getStatusLabel(equipment.statut)}
                  </span>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
                  <div>
                    <p><strong>Date de remise :</strong><br>
                    ${new Date(equipment.dateRemise!).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                  ${equipment.dateRestitution ? `
                    <div>
                      <p><strong>Date de restitution :</strong><br>
                      ${new Date(equipment.dateRestitution).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric', 
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  ` : ''}
                </div>

                ${equipment.validationClient ? `
                  <div class="validation">
                    <p><strong>✓ Validé par :</strong> ${equipment.validationClient.nomClient}</p>
                    <p><strong>Date de validation :</strong> ${new Date(equipment.validationClient.dateValidation).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}</p>
                    ${equipment.validationClient.signature ? `
                      <div class="signature-client">
                        <p><strong>Signature du client :</strong></p>
                        <img src="${equipment.validationClient.signature}" alt="Signature client" />
                        <p style="margin-top: 10px; font-style: italic;">Signé par : ${equipment.validationClient.nomClient}</p>
                      </div>
                    ` : ''}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <div class="footer">
          <p><strong>BEL AIR CAMP</strong></p>
          <p>SIREN : [À REMPLIR]</p>
          <br>
          <p>Document généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          <p>Système de gestion des équipements</p>
        </div>
      </body>
      </html>
    `;
  };

  // Télécharger le PDF des équipements
  const handleDownloadEquipmentPDF = () => {
    const content = generateEquipmentPDFContent();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fiche-equipements-${client.nom.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Fiche équipements téléchargée avec succès');
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

                      {/* Error Alert - Missing from Stock */}
                      {isEquipmentMissingFromStock(equipment) && (
                        <div className="p-2 bg-destructive/10 rounded border-l-4 border-destructive">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <span className="text-destructive font-medium text-xs">
                              Erreur: Élément manquant dans le stock
                            </span>
                          </div>
                        </div>
                      )}

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
        
        {client.equipements.length > 0 && (
          <Button 
            variant="outline"
            onClick={handleDownloadEquipmentPDF}
            className="h-12"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Télécharger la fiche équipements (PDF)
          </Button>
        )}
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