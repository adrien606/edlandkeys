import { ArrowLeft, Search, MessageSquare, Phone, Settings, History, HelpCircle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useClients } from '@/hooks/useClients';
import { useBuildings } from '@/hooks/useBuildings';
import { useNotifications } from '@/hooks/useNotifications';
import { MessageTemplateService, SMSService, WhatsAppService } from '@/services/notificationService';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationsDashboardProps {
  onSwitchApp: () => void;
  onNavigate: (route: 'templates' | 'history' | 'guide') => void;
}

export function NotificationsDashboard({ onSwitchApp, onNavigate }: NotificationsDashboardProps) {
  const { clients, loading: clientsLoading, searchTerm, setSearchTerm, selectedBuilding, setSelectedBuilding } = useClients();
  const { buildings, loading: buildingsLoading } = useBuildings();
  const { addNotification } = useNotifications();

  const handleSendSMS = async (client: any) => {
    const templates = MessageTemplateService.getTemplates();
    const message = MessageTemplateService.formatMessage(templates.sms, `${client.prenom} ${client.nom}`);
    
    const success = SMSService.sendSMS(client.telephone, message);
    if (success) {
      await addNotification(client.id, message, 'sms');
    }
  };

  const handleSendWhatsApp = async (client: any) => {
    const templates = MessageTemplateService.getTemplates();
    const message = MessageTemplateService.formatMessage(templates.whatsapp, `${client.prenom} ${client.nom}`);
    
    const success = WhatsAppService.sendWhatsApp(client.telephone, message);
    if (success) {
      await addNotification(client.id, message, 'whatsapp');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onSwitchApp}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications Colis</h1>
            <p className="text-muted-foreground">Envoyez des notifications SMS et WhatsApp aux clients</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => onNavigate('guide')}
            className="flex items-center space-x-2"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Guide</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => onNavigate('templates')}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Templates</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => onNavigate('history')}
            className="flex items-center space-x-2"
          >
            <History className="h-4 w-4" />
            <span>Historique</span>
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Bâtiments</p>
                <p className="text-2xl font-bold">{buildings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-blue-500 rounded-full" />
              <div>
                <p className="text-sm font-medium">Total Clients</p>
                <p className="text-2xl font-bold">{clientsLoading ? '...' : clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">SMS</p>
                <p className="text-sm text-muted-foreground">App native</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">WhatsApp</p>
                <p className="text-sm text-muted-foreground">Web</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtres et Recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client (nom, prénom, email)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedBuilding || "all"} onValueChange={(value) => setSelectedBuilding(value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par bâtiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les bâtiments</SelectItem>
                {buildings.map((building) => (
                  <SelectItem key={building.id} value={building.id}>
                    {building.nom} ({building.code}) - {building.clientCount} clients
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des clients */}
      <Card>
        <CardHeader>
          <CardTitle>Clients ({clients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {clientsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun client trouvé avec les critères de recherche.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-bold">{client.prenom} {client.nom}</h3>
                      {client.building && (
                        <Badge variant="outline">
                          {client.building.nom} ({client.building.code})
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="font-normal">📧 {client.email}</p>
                      <p className="font-normal">📞 {client.telephone}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleSendSMS(client)}
                      size="sm"
                      variant="outline"
                      className="flex items-center space-x-1"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>SMS</span>
                    </Button>
                    
                    <Button
                      onClick={() => handleSendWhatsApp(client)}
                      size="sm"
                      className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
                    >
                      <Phone className="h-4 w-4" />
                      <span>WhatsApp</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}