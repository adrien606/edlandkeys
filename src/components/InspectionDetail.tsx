import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupabaseStore } from "@/hooks/useSupabaseStore";
import { ArrowLeft, Download, Mail, Eye, User, Calendar, CheckCircle2, AlertTriangle, XCircle, LogOut, ExternalLink, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

const INSPECTION_AREAS = [
  { key: 'prises', label: 'Prises électriques' },
  { key: 'murs', label: 'Murs' },
  { key: 'sol', label: 'Sol' },
  { key: 'plafond', label: 'Plafond' },
  { key: 'fenetres', label: 'Fenêtres' },
  { key: 'portes', label: 'Portes' }
] as const;

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


interface InspectionDetailProps {
  inspectionId: string;
  onNavigate: (route: string) => void;
  onBack: () => void;
  onSwitchApp?: () => void;
}

export const InspectionDetail = ({ inspectionId, onNavigate, onBack, onSwitchApp }: InspectionDetailProps) => {
  const { inspections, createInspection, deleteInspection, buildings } = useSupabaseStore();
  type StoreInspection = (typeof inspections)[number];

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [inspection, setInspection] = useState<StoreInspection | null>(
    inspections.find((i) => i.id === inspectionId) ?? null
  );
  const [entryInspectionDetails, setEntryInspectionDetails] = useState<StoreInspection | null>(null);
  const [isLoadingInspection, setIsLoadingInspection] = useState(true);

  const mapInspection = (dbInspection: any): StoreInspection => ({
    id: dbInspection.id,
    client_id: dbInspection.client_id,
    client_name: dbInspection.client_name,
    client_email: dbInspection.client_email,
    building_id: dbInspection.building_id,
    building_code: dbInspection.building_code,
    type: dbInspection.type,
    entry_inspection_id: dbInspection.entry_inspection_id,
    date: dbInspection.date || dbInspection.created_at || new Date().toISOString(),
    items: dbInspection.items,
    signature: dbInspection.signature || '',
    site_manager_name: dbInspection.site_manager_name,
    site_manager_signature: dbInspection.site_manager_signature,
    completed: dbInspection.completed || false,
    pdf_generated: dbInspection.pdf_generated || false,
    email_sent: dbInspection.email_sent || false,
    created_at: dbInspection.created_at,
    updated_at: dbInspection.updated_at,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchInspectionDetails = async () => {
      setIsLoadingInspection(true);

      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .eq('id', inspectionId)
        .single();

      if (!isMounted) return;

      if (error) {
        console.error("Erreur lors du chargement du détail d'état des lieux:", error);
        setInspection(inspections.find((i) => i.id === inspectionId) ?? null);
        setIsLoadingInspection(false);
        return;
      }

      setInspection(mapInspection(data));
      setIsLoadingInspection(false);
    };

    fetchInspectionDetails();

    return () => {
      isMounted = false;
    };
  }, [inspectionId]);

  useEffect(() => {
    if (inspection?.type !== 'exit' || !inspection.entry_inspection_id) {
      setEntryInspectionDetails(null);
      return;
    }

    let isMounted = true;

    const fetchEntryInspectionDetails = async () => {
      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .eq('id', inspection.entry_inspection_id)
        .single();

      if (!isMounted) return;

      if (error || !data) {
        setEntryInspectionDetails(inspections.find((i) => i.id === inspection.entry_inspection_id) ?? null);
        return;
      }

      setEntryInspectionDetails(mapInspection(data));
    };

    fetchEntryInspectionDetails();

    return () => {
      isMounted = false;
    };
  }, [inspection?.entry_inspection_id, inspection?.type]);

  // Trouver l'état de sortie associé si c'est un état d'entrée
  const exitInspection = inspection?.type === 'entry'
    ? inspections.find(i => i.type === 'exit' && i.entry_inspection_id === inspection.id)
    : null;

  // Trouver l'état d'entrée associé si c'est un état de sortie
  const entryInspection = inspection?.type === 'exit' && inspection.entry_inspection_id
    ? (entryInspectionDetails || inspections.find(i => i.id === inspection.entry_inspection_id) || null)
    : null;

  if (isLoadingInspection) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement du détail de l'état des lieux...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
    const entryInspection = inspection.type === 'exit' && inspection.entry_inspection_id 
      ? inspections.find(i => i.id === inspection.entry_inspection_id)
      : null;

    // Récupérer les informations du bâtiment
    const building = buildings.find(b => b.id === inspection.building_id);
    
    let html = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>État des Lieux - ${inspection.client_name}</title>
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
            .signatures { 
              margin-top: 30px; 
              display: flex; 
              flex-wrap: wrap; 
              gap: 30px; 
              justify-content: space-around;
            }
            .signatures .signature { 
              flex: 1; 
              min-width: 250px; 
              margin-top: 0; 
            }
            .signature-with-logo {
              display: flex;
              align-items: center;
              gap: 20px;
              justify-content: space-between;
            }
            .signature-img {
              max-width: 250px;
              height: auto;
              border: 1px solid #ddd;
            }
            .company-logo {
              max-width: 120px;
              height: auto;
              opacity: 0.8;
            }
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
            <p><strong>Nom:</strong> ${inspection.client_name}</p>
            <p><strong>Email:</strong> ${inspection.client_email}</p>
            ${building ? `<p><strong>Bâtiment:</strong> ${building.nom} (${building.code})</p>` : ''}
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
              ${entryItem.photos && entryItem.photos.length > 0 ? `
                <p style="margin: 10px 0 5px 0; color: #6c757d;"><strong>Photos d'entrée (${entryItem.photos.length}):</strong></p>
                <div class="photos">
                  ${entryItem.photos.map(photo => `<img src="${photo}" class="photo" alt="Photo entrée ${area.label}" style="border: 2px solid #6c757d;">`).join('')}
                </div>
              ` : ''}
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
              ${item.photos.map(photo => `<img src="${photo}" class="photo" alt="Photo actuelle ${area.label}">`).join('')}
            </div>
          ` : ''}
        </div>`;
    });
    
    // Signatures section
    if (inspection.signature || inspection.site_manager_signature) {
      html += `<div class="signatures">`;
      
      if (inspection.signature) {
        html += `
          <div class="signature">
            <h3>Signature du client</h3>
            <img src="${inspection.signature}" alt="Signature du client">
          </div>`;
      }
      
      if (inspection.site_manager_signature) {
        html += `
          <div class="signature">
            <h3>Responsable de site${inspection.site_manager_name ? ' - ' + inspection.site_manager_name : ''}</h3>
            <img src="${inspection.site_manager_signature}" alt="Signature du responsable de site" class="signature-img">
          </div>`;
      }
      
      html += `</div>`;
    }
    
    // Ajouter le pied de page avec nom du client, adresse du bâtiment et "lu et approuvé"
    html += `
          <div class="footer">
            <div class="footer-content">
              <div>
                <strong>Client :</strong> ${inspection.client_name}
              </div>
              <div>
                ${building ? `<strong>Bâtiment :</strong> ${building.nom} (${building.code})` : ''}
              </div>
            </div>
            <div class="approval">
              Lu et approuvé
            </div>
            <div class="company-info">
              Fait par BEL AIR CAMP - SIREN : 821797073
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
      link.download = `etat-des-lieux-${inspection.client_name.replace(/\s+/g, '-')}-${format(new Date(inspection.date), 'yyyy-MM-dd')}.html`;
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

  // Fonction pour envoyer par email : télécharge le PDF puis ouvre le client mail
  const handleSendEmail = () => {
    try {
      const htmlContent = generatePDFContent();
      const inspectionDate = format(new Date(inspection.date), 'yyyy-MM-dd');
      const typeLabel = inspection.type === 'entry' ? 'État d\'entrée' : 'État de sortie';
      const fileName = `etat-des-lieux-${inspection.client_name.replace(/\s+/g, '-')}-${inspectionDate}.html`;

      // 1. Télécharger le fichier PDF/HTML automatiquement
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 2. Ouvrir le client mail avec message pré-rempli
      const subject = `${typeLabel} - ${inspection.client_name}`;
      const formattedDate = format(new Date(inspection.date), 'dd MMMM yyyy à HH:mm', { locale: fr });
      let body = `Bonjour,\n\nVeuillez trouver ci-joint l'état des lieux suivant :\n\n`;
      body += `Client : ${inspection.client_name}\n`;
      body += `Type : ${typeLabel}\n`;
      body += `Date : ${formattedDate}\n`;
      if (inspection.building_code) {
        body += `Bâtiment : ${inspection.building_code}\n`;
      }
      body += `\nCordialement,\nBEL AIR CAMP`;

      const mailtoLink = `mailto:${inspection.client_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      setTimeout(() => {
        window.location.href = mailtoLink;
      }, 500);

      toast.success('Le document a été téléchargé. Ajoutez-le en pièce jointe dans le mail qui s\'ouvre.');
    } catch (error) {
      console.error('Erreur lors de l\'envoi email:', error);
      toast.error('Erreur lors de la préparation de l\'email');
    }
  };

  // Fonction pour créer un état de sortie basé sur l'état d'entrée
  const handleCreateExitInspection = () => {
    if (inspection.type !== 'entry') return;
    
    // Créer un nouvel état de sortie avec les mêmes informations client et référence à l'entrée
    createInspection(
      inspection.client_id,
      inspection.client_name,
      inspection.client_email,
      'exit',
      inspection.building_id,
      inspection.id // Référence à l'inspection d'entrée
    );
    
    toast.success('État de sortie créé. Vous pouvez maintenant faire la nouvelle inspection.');
    onNavigate('inspection-form');
  };

  // Fonction pour supprimer l'inspection
  const handleDeleteInspection = () => {
    deleteInspection(inspection.id);
    setIsDeleteDialogOpen(false);
    toast.success('État des lieux supprimé avec succès');
    onBack(); // Retourner à la page précédente après suppression
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
              <p className="text-muted-foreground">{inspection.client_name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
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
            {/* Lien vers l'état d'entrée originel (si c'est un état de sortie) */}
            {inspection.type === 'exit' && inspection.entry_inspection_id && (
              <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">État d'entrée de référence</p>
                    <p className="text-xs text-muted-foreground">
                      Cliquez pour consulter l'état des lieux d'entrée originel
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate(`inspection-detail/${inspection.entry_inspection_id}`)}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Voir l'entrée
                  </Button>
                </div>
              </div>
            )}

            {/* Lien vers l'état de sortie (si c'est un état d'entrée et qu'il existe un état de sortie) */}
            {inspection.type === 'entry' && exitInspection && (
              <div className="mb-4 p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-foreground">État de sortie associé</p>
                    <p className="text-xs text-muted-foreground">
                      Cliquez pour consulter l'état des lieux de sortie réalisé
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(exitInspection.date), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate(`inspection-detail/${exitInspection.id}`)}
                    className="border-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Voir la sortie
                  </Button>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Client</p>
                <p className="text-lg">{inspection.client_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg">{inspection.client_email}</p>
              </div>
              {inspection.building_code && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bâtiment</p>
                  <p className="text-lg">{inspection.building_code}</p>
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
                const entryItem = entryInspection?.items[area.key as keyof typeof entryInspection.items];
                const isExitInspection = inspection.type === 'exit';
                
                return (
                  <Card key={area.key} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-lg">{area.label}</h3>
                        <div className="flex items-center gap-2">
                          {isExitInspection && entryItem && (
                            <>
                              <div className="text-right">
                                <div className="text-xs text-muted-foreground">Entrée</div>
                                <Badge className={getStatusColor(entryItem.status)} variant="outline">
                                  {getStatusIcon(entryItem.status)}
                                  <span className="ml-1">{getStatusLabel(entryItem.status)}</span>
                                </Badge>
                              </div>
                              <div className="text-muted-foreground">→</div>
                            </>
                          )}
                          <div className="text-right">
                            {isExitInspection && entryItem && (
                              <div className="text-xs text-muted-foreground">Sortie</div>
                            )}
                            <Badge className={getStatusColor(item.status)}>
                              {getStatusIcon(item.status)}
                              <span className="ml-1">{getStatusLabel(item.status)}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Comparaison des commentaires pour l'état de sortie */}
                      {isExitInspection && entryItem && entryItem.comment && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Commentaire d'entrée:</p>
                          <p className="text-sm bg-muted p-2 rounded italic">{entryItem.comment}</p>
                        </div>
                      )}
                      
                      {item.comment && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            {isExitInspection ? 'Commentaire de sortie:' : 'Commentaire:'}
                          </p>
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
        {/* Signatures Section */}
        {(inspection.signature || inspection.site_manager_signature) && (
          <Card>
            <CardHeader>
              <CardTitle>Signatures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {inspection.signature && (
                <div>
                  <h4 className="font-medium mb-3">Signature du client</h4>
                  <div className="border rounded p-4 bg-white">
                    <img 
                      src={inspection.signature} 
                      alt="Signature du client"
                      className="max-w-full h-auto"
                    />
                  </div>
                </div>
              )}
              
              {inspection.site_manager_signature && (
                <div>
                  <h4 className="font-medium mb-3">
                    Responsable de site
                    {inspection.site_manager_name && (
                      <span className="text-muted-foreground font-normal"> - {inspection.site_manager_name}</span>
                    )}
                  </h4>
                  <div className="border rounded p-4 bg-white">
                    <img 
                      src={inspection.site_manager_signature} 
                      alt="Signature du responsable de site"
                      className="max-w-full h-auto"
                    />
                  </div>
                </div>
              )}
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer l'état des lieux</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer cet état des lieux ? Cette action est irréversible.
                {inspection.type === 'entry' && exitInspection && (
                  <div className="mt-2 p-2 bg-warning/10 border border-warning/20 rounded text-sm">
                    <strong>⚠️ Attention :</strong> Cet état d'entrée est lié à un état de sortie. 
                    Supprimer l'état d'entrée n'affectera pas l'état de sortie, mais la référence sera perdue.
                  </div>
                )}
                {inspection.type === 'exit' && inspection.entry_inspection_id && (
                  <div className="mt-2 p-2 bg-info/10 border border-info/20 rounded text-sm">
                    <strong>ℹ️ Info :</strong> L'état d'entrée de référence sera conservé.
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteInspection}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer définitivement
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};