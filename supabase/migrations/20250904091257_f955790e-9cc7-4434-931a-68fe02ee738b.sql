-- Créer la table user_activities pour stocker l'historique réel des activités utilisateur
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux admins de voir toutes les activités
CREATE POLICY "Admins can view all activities" 
ON public.user_activities 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Politique pour permettre aux utilisateurs de voir leurs propres activités
CREATE POLICY "Users can view their own activities" 
ON public.user_activities 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Politique pour permettre l'insertion d'activités (pour le logging automatique)
CREATE POLICY "Users can insert their own activities" 
ON public.user_activities 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Créer un index pour optimiser les requêtes par utilisateur et date
CREATE INDEX idx_user_activities_user_id_created_at ON public.user_activities(user_id, created_at DESC);

-- Fonction pour logger automatiquement les activités utilisateur
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id UUID,
  p_action TEXT,
  p_details TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.user_activities (user_id, action, details, metadata)
  VALUES (p_user_id, p_action, p_details, p_metadata)
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;