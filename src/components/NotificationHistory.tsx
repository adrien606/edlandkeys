import { ArrowLeft, Trash2, MessageSquare, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications } from '@/hooks/useNotifications';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationHistoryProps {
  onBack: () => void;
}

export function NotificationHistory({ onBack }: NotificationHistoryProps) {
  const { notifications, loading, clearHistory } = useNotifications();

  const getTypeIcon = (type: string) => {
    return type === 'sms' ? (
      <MessageSquare className="h-4 w-4 text-blue-500" />
    ) : (
      <Phone className="h-4 w-4 text-green-600" />
    );
  };

  const getTypeLabel = (type: string) => {
    return type === 'sms' ? 'SMS' : 'WhatsApp';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Historique des Notifications</h1>
            <p className="text-muted-foreground">
              {loading ? "Chargement..." : `${notifications.length} notification${notifications.length > 1 ? 's' : ''} envoyée${notifications.length > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        
        {notifications.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Vider l'historique</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Vider l'historique ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action supprimera définitivement toutes les notifications de l'historique.
                  Cette action ne peut pas être annulée.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={clearHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">SMS envoyés</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : notifications.filter(n => n.type === 'sms').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">WhatsApp envoyés</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : notifications.filter(n => n.type === 'whatsapp').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Aujourd'hui</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : notifications.filter(n => {
                    const today = new Date().toDateString();
                    const notifDate = new Date(n.sent_at).toDateString();
                    return today === notifDate;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Historique détaillé</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[300px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucune notification envoyée</h3>
              <p className="text-muted-foreground">
                L'historique des notifications apparaîtra ici une fois que vous aurez envoyé des messages.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold truncate">
                        {notification.client.prenom} {notification.client.nom}
                      </h3>
                      <Badge variant={notification.type === 'sms' ? 'secondary' : 'default'}>
                        {getTypeLabel(notification.type)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {notification.status === 'sent' ? '✓ Envoyé' : '✗ Échec'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>📞 {notification.client.telephone}</span>
                      <span>⏰ {formatDate(notification.sent_at)}</span>
                    </div>
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