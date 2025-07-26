-- Corriger le warning de sécurité pour la fonction handle_updated_at
ALTER FUNCTION public.handle_updated_at() SET search_path = '';