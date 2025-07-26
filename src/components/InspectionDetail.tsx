import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInspectionStore } from "@/store/useInspectionStore";
import { ArrowLeft, Download, Mail, Eye, User, Calendar, CheckCircle2, AlertTriangle, XCircle, LogOut } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { INSPECTION_AREAS } from "@/types/inspection";
import { toast } from "sonner";

interface InspectionDetailProps {
  inspectionId: string;
  onNavigate: (route: string) => void;
  onBack: () => void;
  onSwitchApp?: () => void;
}

export const InspectionDetail = ({ inspectionId, onNavigate, onBack, onSwitchApp }: InspectionDetailProps) => {
  const { inspections, createInspection, setCurrentInspection } = useInspectionStore();
  
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

  // Fonction pour générer le contenu HTML du PDF
  const generatePDFContent = () => {
    const inspectionDate = format(new Date(inspection.date), 'dd MMMM yyyy à HH:mm', { locale: fr });
    const typeLabel = inspection.type === 'entry' ? 'État d\'entrée' : 'État de sortie';
    
    // Récupérer l'inspection d'entrée si c'est un état de sortie
    const entryInspection = inspection.type === 'exit' && inspection.entryInspectionId 
      ? inspections.find(i => i.id === inspection.entryInspectionId)
      : null;

    // Récupérer les informations du bâtiment
    const { inspectionBuildings } = useInspectionStore.getState();
    const building = inspection.buildingId 
      ? inspectionBuildings.find(b => b.id === inspection.buildingId)
      : null;
    
    let html = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>État des Lieux - ${inspection.clientName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .client-info { margin-bottom: 30px; }
            .inspection-item { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; }
            .status-good { color: #16a34a; }
            .status-damaged { color: #ea580c; }
            .status-missing { color: #dc2626; }
            .status-attention { color: #d97706; }
            .signature { margin-top: 30px; text-align: center; margin-bottom: 40px; }
            .signature img { max-width: 300px; border: 1px solid #ddd; }
            .photo { width: 150px; height: 150px; object-fit: cover; margin: 5px; border: 1px solid #ddd; }
            .footer { 
              margin-top: 40px; 
              border-top: 2px solid #333; 
              padding-top: 20px; 
              font-size: 12px; 
            }
            .footer-content { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
            .footer-left, .footer-right { flex: 1; }
            .footer-center { flex: 1; text-align: center; }
            .approval { text-align: center; font-weight: bold; margin: 15px 0; font-size: 14px; }
            .company-info { text-align: center; font-style: italic; color: #666; border-top: 1px solid #ddd; padding-top: 15px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ÉTAT DES LIEUX</h1>
            <h2>${typeLabel}</h2>
            <p><strong>Date:</strong> ${inspectionDate}</p>
          </div>
          
          <div class="client-info">
            <h3>Informations Client</h3>
            <p><strong>Nom:</strong> ${inspection.clientName}</p>
            <p><strong>Email:</strong> ${inspection.clientEmail}</p>
            ${inspection.buildingCode ? `<p><strong>Bâtiment:</strong> ${inspection.buildingCode}</p>` : ''}
          </div>
          
          <div class="inspection-details">
            <h3>Détails de l'inspection</h3>`;
    
    INSPECTION_AREAS.forEach((area) => {
      const item = inspection.items[area.key as keyof typeof inspection.items];
      const entryItem = entryInspection?.items[area.key as keyof typeof entryInspection.items];
      const statusClass = `status-${item.status.replace('_', '-')}`;
      
      html += `
        <div class="inspection-item">
          <h4>${area.label}</h4>
          
          ${entryItem ? `
            <div style="background: #f8f9fa; padding: 10px; margin-bottom: 15px; border-left: 3px solid #6c757d;">
              <h5 style="margin: 0 0 5px 0; color: #6c757d;">État d'entrée (référence)</h5>
              <p style="margin: 0; color: #6c757d;"><strong>État:</strong> ${getStatusLabel(entryItem.status)}</p>
              ${entryItem.comment ? `<p style="margin: 5px 0 0 0; color: #6c757d; font-style: italic;">"${entryItem.comment}"</p>` : ''}
            </div>
          ` : ''}
          
          <p class="${statusClass}"><strong>État actuel:</strong> ${getStatusLabel(item.status)}</p>
          ${item.comment ? `<p><strong>Commentaire:</strong> ${item.comment}</p>` : ''}
          
          ${entryItem && entryItem.status !== item.status ? `
            <div style="background: #fff3cd; padding: 10px; margin: 10px 0; border: 1px solid #ffeaa7; border-radius: 4px;">
              <strong style="color: #856404;">⚠️ Changement détecté:</strong>
              <br><span style="color: #856404;">${getStatusLabel(entryItem.status)} → ${getStatusLabel(item.status)}</span>
            </div>
          ` : ''}
          
          ${item.photos && item.photos.length > 0 ? `
            <p><strong>Photos actuelles (${item.photos.length}):</strong></p>
            <div class="photos">
              ${item.photos.map(photo => `<img src="${photo}" class="photo" alt="Photo ${area.label}">`).join('')}
            </div>
          ` : ''}
        </div>`;
    });
    
    if (inspection.signature) {
      html += `
        <div class="signature">
          <h3>Signature du client</h3>
          <img src="${inspection.signature}" alt="Signature du client">
        </div>`;
    }
    
    // Ajouter le pied de page avec nom du client, adresse du bâtiment et "lu et approuvé"
    html += `
          <div class="footer">
            <div class="footer-content">
              <div>
                <strong>Client :</strong> ${inspection.clientName}
              </div>
              <div>
                ${building && building.adresse ? `<strong>Adresse :</strong> ${building.adresse}` : ''}
              </div>
            </div>
            <div class="approval">
              Lu et approuvé
            </div>
            <div class="company-info">
              Fait par BEL AIR CAMP
            </div>
          </div>
          </div>
        </body>
      </html>`;
    
    return html;
  };

  // Fonction pour télécharger le PDF
  const handleDownloadPDF = async () => {
    try {
      const htmlContent = generatePDFContent();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `etat-des-lieux-${inspection.clientName.replace(/\s+/g, '-')}-${format(new Date(inspection.date), 'yyyy-MM-dd')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('État des lieux téléchargé avec succès');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  // Fonction pour aperçu PDF
  const handlePreviewPDF = () => {
    try {
      const htmlContent = generatePDFContent();
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        toast.success('Aperçu ouvert dans un nouvel onglet');
      } else {
        toast.error('Impossible d\'ouvrir l\'aperçu (pop-up bloqué)');
      }
    } catch (error) {
      console.error('Erreur lors de l\'aperçu:', error);
      toast.error('Erreur lors de l\'aperçu');
    }
  };

  // Fonction pour envoyer par email
  const handleSendEmail = () => {
    try {
      const subject = `État des lieux - ${inspection.clientName}`;
      const inspectionDate = format(new Date(inspection.date), 'dd MMMM yyyy à HH:mm', { locale: fr });
      const typeLabel = inspection.type === 'entry' ? 'État d\'entrée' : 'État de sortie';
      
      let body = `Bonjour,\n\nVeuillez trouver ci-joint l'état des lieux suivant :\n\n`;
      body += `Client: ${inspection.clientName}\n`;
      body += `Type: ${typeLabel}\n`;
      body += `Date: ${inspectionDate}\n`;
      if (inspection.buildingCode) {
        body += `Bâtiment: ${inspection.buildingCode}\n`;
      }
      body += `\nCordialement`;
      
      const mailtoLink = `mailto:${inspection.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
      
      toast.success('Client email ouvert');
    } catch (error) {
      console.error('Erreur lors de l\'envoi email:', error);
      toast.error('Erreur lors de l\'ouverture du client email');
    }
  };

  // Fonction pour créer un état de sortie basé sur l'état d'entrée
  const handleCreateExitInspection = () => {
    if (inspection.type !== 'entry') return;
    
    // Créer un nouvel état de sortie avec les mêmes informations client et référence à l'entrée
    createInspection(
      inspection.clientId,
      inspection.clientName,
      inspection.clientEmail,
      'exit',
      inspection.buildingId,
      inspection.id // Référence à l'inspection d'entrée
    );
    
    toast.success('État de sortie créé. Vous pouvez maintenant faire la nouvelle inspection.');
    onNavigate('inspection-form');
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
            {/* Bouton spécial pour créer un état de sortie à partir d'un état d'entrée */}
            {inspection.type === 'entry' && inspection.completed && (
              <div className="mb-4">
                <Button 
                  onClick={handleCreateExitInspection}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Créer l'État de Sortie
                </Button>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Créer un nouvel état des lieux de sortie basé sur cet état d'entrée
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-12" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </Button>
              
              <Button variant="outline" className="h-12" onClick={handleSendEmail}>
                <Mail className="w-4 h-4 mr-2" />
                Envoyer par email
              </Button>
              
              <Button variant="outline" className="h-12" onClick={handlePreviewPDF}>
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