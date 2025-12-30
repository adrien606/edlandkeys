import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useActivityLogger = () => {
  const { user } = useAuth();

  const logActivity = async (action: string, details?: string, metadata?: any) => {
    if (!user) return;

    try {
      await supabase.rpc('log_user_activity', {
        p_user_id: user.id,
        p_action: action,
        p_details: details,
        p_metadata: metadata
      });
    } catch (error) {
      console.error('Erreur lors du logging de l\'activité:', error);
    }
  };

  return { logActivity };
};