import { ArrowLeft, Search, MessageSquare, Phone, Settings, History, HelpCircle, Building2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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

  const handleSendSMS = async (client: any, phoneNumber?: string) => {
    const templates = MessageTemplateService.getTemplates();
    const message = MessageTemplateService.formatMessage(templates.sms, `${client.prenom} ${client.nom}`);
    const phone = phoneNumber || client.telephone;
    
    const success = SMSService.sendSMS(phone, message);
    if (success) {
      await addNotification(client.id, message, 'sms');
    }
  };

  const handleSendWhatsApp = async (client: any, phoneNumber?: string) => {
    const templates = MessageTemplateService.getTemplates();
    const message = MessageTemplateService.formatMessage(templates.whatsapp, `${client.prenom} ${client.nom}`);
    const phone = phoneNumber || client.telephone;
    
    const success = WhatsAppService.sendWhatsApp(phone, message);
    if (success) {
      await addNotification(client.id, message, 'whatsapp');
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onSwitchApp}
            className="h-10 w-10 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Notifications Colis</h1>
            <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">Envoyez des notifications SMS et WhatsApp aux clients</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:space-x-2 sm:flex-nowrap">
          <Button
            variant="outline"
            onClick={() => onNavigate('guide')}
            className="flex items-center space-x-2 text-xs sm:text-sm"
            size="sm"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Guide</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => onNavigate('templates')}
            className="flex items-center space-x-2 text-xs sm:text-sm"
            size="sm"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => onNavigate('history')}
            className="flex items-center space-x-2 text-xs sm:text-sm"
            size="sm"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Historique</span>
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
                <div key={client.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="font-bold text-foreground text-sm sm:text-base">{client.prenom} {client.nom}</h3>
                      {client.building && (
                        <Badge variant="outline" className="text-xs self-start">
                          {client.building.nom} ({client.building.code})
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      <p className="font-normal break-all">📧 {client.email}</p>
                      <p className="font-normal">📞 {client.telephone}</p>
                      {client.telephone_secondaire && (
                        <p className="font-normal">📞 {client.telephone_secondaire} <span className="text-muted-foreground">(secondaire)</span></p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 self-start sm:self-center">
                    {/* SMS Button */}
                    {client.telephone_secondaire ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center space-x-1 text-xs"
                          >
                            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>SMS</span>
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleSendSMS(client, client.telephone)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Principal: {client.telephone}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendSMS(client, client.telephone_secondaire)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Secondaire: {client.telephone_secondaire}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button
                        onClick={() => handleSendSMS(client)}
                        size="sm"
                        variant="outline"
                        className="flex items-center space-x-1 text-xs"
                      >
                        <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>SMS</span>
                      </Button>
                    )}
                    
                    {/* WhatsApp Button */}
                    {client.telephone_secondaire ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-xs"
                          >
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>WhatsApp</span>
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleSendWhatsApp(client, client.telephone)}>
                            <Phone className="h-4 w-4 mr-2" />
                            Principal: {client.telephone}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendWhatsApp(client, client.telephone_secondaire)}>
                            <Phone className="h-4 w-4 mr-2" />
                            Secondaire: {client.telephone_secondaire}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button
                        onClick={() => handleSendWhatsApp(client)}
                        size="sm"
                        className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-xs"
                      >
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>WhatsApp</span>
                      </Button>
                    )}
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