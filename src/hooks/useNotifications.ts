import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  client_id: string;
  message: string;
  type: 'sms' | 'whatsapp';
  status: 'sent' | 'failed';
  sent_at: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationWithClient extends Notification {
  client: {
    nom: string;
    prenom: string;
    telephone: string;
  };
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          client:clients(nom, prenom, telephone)
        `)
        .order('sent_at', { ascending: false });

      if (error) throw error;

      setNotifications(data?.map(notification => ({
        ...notification,
        client: notification.client as any
      })) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des notifications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addNotification = async (clientId: string, message: string, type: 'sms' | 'whatsapp') => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          client_id: clientId,
          message,
          type,
          status: 'sent'
        }]);

      if (error) throw error;

      await fetchNotifications();
      
      toast({
        title: "Notification envoyée",
        description: `Message ${type.toUpperCase()} envoyé avec succès.`,
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la notification:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la notification.",
        variant: "destructive",
      });
    }
  };

  const clearHistory = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;

      setNotifications([]);
      toast({
        title: "Historique vidé",
        description: "L'historique des notifications a été supprimé.",
      });
    } catch (error) {
      console.error('Erreur lors du vidage de l\'historique:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vider l'historique.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    loading,
    addNotification,
    clearHistory,
    refetch: fetchNotifications
  };
};