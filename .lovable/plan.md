# Fiabiliser les états des lieux

## Objectif
Empêcher qu’un état des lieux commencé ou terminé disparaisse, même après plusieurs créations pour le même client et le même bâtiment.

## Changements
- Créer immédiatement un brouillon dans Supabase avant d’ouvrir le formulaire ; si la création échoue, rester sur l’écran de départ avec une erreur claire.
- Sauvegarder automatiquement l’avancement du brouillon pendant la saisie.
- Finaliser par une écriture confirmée par Supabase, sans considérer une sauvegarde hors ligne comme réussie.
- Compresser les nouvelles photos avant stockage pour éviter les requêtes démesurées actuellement observées (jusqu’à environ 53 Mo par état des lieux).
- Conserver chaque état des lieux sous un identifiant unique, sans déduplication par client, e-mail ou bâtiment.

## Vérification
- Contrôler la compilation TypeScript.
- Tester la création successive de plusieurs états des lieux pour un même client/bâtiment et vérifier leur présence dans l’historique après actualisation.

## Détails techniques
Les brouillons et états terminés restent dans la table `inspections`. Aucun changement de schéma n’est nécessaire : la colonne `completed` distingue déjà les brouillons des documents finalisés.
