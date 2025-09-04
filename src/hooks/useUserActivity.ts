import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  details?: string;
  metadata?: any;
  created_at: string;
}

export const useUserActivity = () => {
  const { user, isAdmin } = useAuth();

  // Fonction pour logger une activité
  const logActivity = async (action: string, details?: string, metadata?: any) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('log_user_activity', {
        p_user_id: user.id,
        p_action: action,
        p_details: details,
        p_metadata: metadata
      });

      if (error) {
        console.error('Erreur lors du logging de l\'activité:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors du logging de l\'activité:', error);
      return null;
    }
  };

  // Fonction pour récupérer les activités d'un utilisateur
  const fetchUserActivities = async (userId: string): Promise<UserActivity[]> => {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erreur lors de la récupération des activités:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des activités:', error);
      return [];
    }
  };

  // Fonction pour récupérer toutes les activités (admin seulement)
  const fetchAllActivities = async (): Promise<UserActivity[]> => {
    if (!isAdmin) {
      console.warn('Accès non autorisé - administrateur requis');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Erreur lors de la récupération de toutes les activités:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération de toutes les activités:', error);
      return [];
    }
  };

  return {
    logActivity,
    fetchUserActivities,
    fetchAllActivities
  };
};