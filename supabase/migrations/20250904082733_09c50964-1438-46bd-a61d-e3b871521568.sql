-- Promouvoir l'utilisateur actuel (Adrien Rippe) au rôle admin
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = 'd6c96fda-ebf6-4bbb-8f16-4e7f6ddae3c4';