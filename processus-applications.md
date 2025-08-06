# PROCESSUS COMPLET DES APPLICATIONS - BEL AIR CAMP

## 1. APPLICATION GESTION DES ÉQUIPEMENTS (COLIS)

### Vue d'ensemble
L'application de gestion des équipements permet de gérer la distribution et le suivi des colis aux clients dans différents bâtiments.

### Processus complet

#### 1.1 Connexion et sélection
1. **Authentification** : L'utilisateur se connecte avec ses identifiants
2. **Sélection d'application** : Choix de "Gestion Équipements" depuis l'écran d'accueil
3. **Sélection du bâtiment** : Choix du bâtiment de travail (influence les données affichées)

#### 1.2 Dashboard et vue d'ensemble
1. **Affichage des statistiques** :
   - Nombre total de clients actifs
   - Nombre total d'équipements distribués
   - Répartition par statut : Remis, Restitués, Perdus, Non rendus
2. **Clients récents** : Affichage des 5 derniers clients ajoutés
3. **Statut de connexion** : Indicateur en ligne/hors ligne et synchronisation

#### 1.3 Ajout d'un nouveau client
1. **Navigation** : Clic sur "Ajouter un client" depuis le dashboard
2. **Saisie des informations** :
   - Nom de l'entreprise (obligatoire)
   - Nom du contact (obligatoire)
   - Adresse email (optionnel)
   - Numéro de téléphone (optionnel)
3. **Validation** : Vérification des champs obligatoires
4. **Enregistrement** : Sauvegarde en base de données
5. **Confirmation** : Toast de confirmation et retour au dashboard

#### 1.4 Remise d'équipement
1. **Navigation** : Clic sur "Remettre équipement" depuis le dashboard
2. **Sélection du client** : Recherche et sélection du client destinataire
3. **Sélection du bâtiment** : Attribution à un bâtiment spécifique
4. **Choix de l'équipement** : Sélection depuis le stock disponible
5. **Validation** : Génération d'un formulaire de validation
6. **Signature client** : Capture de la signature du client sur l'écran
7. **Finalisation** : 
   - Statut équipement passé à "Remis"
   - Date de remise enregistrée
   - Association client-équipement créée

#### 1.5 Gestion du stock
1. **Navigation** : Accès via "Gérer stock" depuis le dashboard
2. **Vue du stock** : Affichage de tous les équipements par bâtiment
3. **Ajout d'équipements** :
   - Saisie des informations (type, numéro, description)
   - Attribution à un bâtiment
   - Définition de la quantité
4. **Modification du stock** :
   - Mise à jour des quantités
   - Changement de statut
   - Modification des descriptions

#### 1.6 Consultation des clients
1. **Navigation** : Clic sur "Voir clients" depuis le dashboard
2. **Liste des clients** : Affichage avec filtrage par bâtiment
3. **Détail client** : 
   - Informations personnelles
   - Liste des équipements associés
   - Historique des actions
4. **Actions disponibles** :
   - Modification des informations
   - Restitution d'équipements
   - Historique complet

#### 1.7 Restitution d'équipement
1. **Sélection** : Depuis la liste client ou équipement
2. **Vérification** : Contrôle de l'état de l'équipement
3. **Validation** : Confirmation de la restitution
4. **Mise à jour** : 
   - Statut passé à "Restitué"
   - Date de restitution enregistrée
   - Libération de l'équipement pour nouveau usage

---

## 2. APPLICATION ÉTATS DES LIEUX (INSPECTIONS)

### Vue d'ensemble
L'application d'états des lieux permet de réaliser des inspections d'entrée et de sortie pour les clients, avec documentation photographique et signature.

### Processus complet

#### 2.1 Accès et navigation
1. **Sélection** : Choix de "États des Lieux" depuis l'écran d'accueil
2. **Dashboard** : Vue d'ensemble avec statistiques
   - Total des états des lieux
   - Nombre d'états d'entrée
   - Nombre d'états de sortie
3. **Historique récent** : Affichage des 5 dernières inspections

#### 2.2 Création d'un nouvel état des lieux
1. **Initiation** : Clic sur "Nouvel État des Lieux"
2. **Sélection du type** :
   - État d'entrée (nouveau client)
   - État de sortie (client existant)
3. **Choix du client** :
   - Sélection depuis la liste existante
   - Ou saisie de nouvelles informations
4. **Sélection du bâtiment** : Attribution à un bâtiment spécifique

#### 2.3 Processus d'inspection détaillé
1. **Zones d'inspection** : Passage par chaque zone définie :
   - Prises électriques
   - Murs
   - Sol
   - Plafond
   - Fenêtres
   - Portes

2. **Pour chaque zone** :
   - **Évaluation de l'état** :
     - Bon état
     - À surveiller
     - Endommagé
     - Manquant
   - **Ajout de commentaires** : Observations détaillées
   - **Prise de photos** : Documentation visuelle obligatoire
   - **Comparaison** (pour les sorties) : Affichage de l'état d'entrée de référence

3. **Navigation** : 
   - Progression zone par zone
   - Barre de progression visuelle
   - Possibilité de revenir en arrière

#### 2.4 Finalisation de l'inspection
1. **Signature du gestionnaire** : Validation par l'agent BelAirCamp
2. **Signature du client** : Validation et accord du client
3. **Génération du PDF** : Création automatique du rapport
4. **Envoi par email** : Transmission automatique au client
5. **Archivage** : Sauvegarde de tous les éléments

#### 2.5 États de sortie spécifiques
1. **Référence à l'entrée** : Liaison automatique avec l'état d'entrée
2. **Comparaison automatique** : Détection des changements
3. **Alertes visuelles** : Signalement des dégradations
4. **Calcul des différences** : Documentation des évolutions

#### 2.6 Consultation de l'historique
1. **Accès** : Via "Historique" depuis le dashboard
2. **Filtrage** : Par client, par date, par type
3. **Détail** : Consultation complète de chaque inspection
4. **Réédition** : Possibilité de régénérer les PDF

---

## 3. APPLICATION NOTIFICATIONS COLIS

### Vue d'ensemble
L'application de notifications permet d'envoyer des messages SMS et WhatsApp aux clients pour les informer de la disponibilité de leurs colis.

### Processus complet

#### 3.1 Accès et configuration
1. **Sélection** : Choix de "Notifications" depuis l'écran d'accueil
2. **Dashboard** : Vue d'ensemble avec statistiques
   - Nombre de bâtiments
   - Nombre total de clients
   - Status des services (SMS, WhatsApp)

#### 3.2 Gestion des templates de messages
1. **Accès** : Via le bouton "Templates" du dashboard
2. **Édition SMS** :
   - Personnalisation du message SMS
   - Variables disponibles : {{nom}}, {{building}}, {{date}}
   - Compteur de caractères (160 max recommandé)
3. **Édition WhatsApp** :
   - Personnalisation du message WhatsApp
   - Mêmes variables disponibles
   - Format plus libre (pas de limite stricte)
4. **Prévisualisation** : Aperçu en temps réel avec exemple
5. **Sauvegarde** : Validation et enregistrement des templates

#### 3.3 Envoi de notifications
1. **Filtrage des clients** :
   - **Recherche textuelle** : Par nom, prénom, email
   - **Filtrage par bâtiment** : Sélection d'un bâtiment spécifique
   - **Vue liste** : Affichage des clients correspondants

2. **Envoi individuel** :
   - **SMS** : Clic sur bouton "SMS" pour un client
     - Ouverture de l'application SMS native
     - Message pré-rempli avec le template
     - Numéro de téléphone pré-saisi
   - **WhatsApp** : Clic sur bouton "WhatsApp"
     - Ouverture de WhatsApp Web
     - Message pré-rempli avec le template
     - Contact pré-sélectionné

3. **Traçabilité** :
   - Enregistrement automatique de chaque envoi
   - Statut : "envoyé" ou "échec"
   - Horodatage de l'envoi

#### 3.4 Historique et suivi
1. **Accès** : Via "Historique" depuis le dashboard
2. **Vue des notifications** :
   - Liste complète des envois
   - Filtrage par type (SMS/WhatsApp)
   - Informations détaillées :
     - Nom du client
     - Type de message
     - Contenu du message
     - Numéro de téléphone
     - Date/heure d'envoi
     - Statut

3. **Statistiques** :
   - Nombre de SMS envoyés
   - Nombre de WhatsApp envoyés
   - Notifications du jour
   - Taux de succès

#### 3.5 Gestion de l'historique
1. **Nettoyage** : Bouton "Vider l'historique"
2. **Confirmation** : Dialog de sécurité
3. **Suppression** : Effacement de toutes les données d'historique

#### 3.6 Guide d'utilisation
1. **Accès** : Via "Guide" depuis le dashboard
2. **Instructions étape par étape** :
   - Configuration des templates
   - Envoi de notifications
   - Consultation de l'historique
3. **Conseils et bonnes pratiques**
4. **Limitations et notes importantes**

---

## FLUX TRANSVERSAUX ET SYNCHRONISATION

### Gestion des bâtiments
- **Centralisation** : Tous les modules utilisent la même base de bâtiments
- **Filtrage** : Chaque module peut filtrer les données par bâtiment
- **Cohérence** : Les données client sont partagées entre modules

### Gestion des clients
- **Base unique** : Une seule table clients pour tous les modules
- **Enrichissement** : Chaque module peut ajouter ses propres données
- **Synchronisation** : Mise à jour en temps réel entre modules

### Sécurité et accès
- **Authentification unique** : Connexion valable pour tous les modules
- **Rôles utilisateur** : 
  - Utilisateur standard : accès aux fonctionnalités de base
  - Administrateur : accès à la gestion des utilisateurs
- **Persistance** : Session maintenue entre les modules

### Données hors ligne
- **Fonctionnement local** : Utilisation possible hors connexion
- **Synchronisation** : Automatique lors du retour de connexion
- **Indicateurs** : Statut visible (en ligne/hors ligne/synchronisation)

### Notifications système
- **Toasts** : Messages de confirmation/erreur dans tous les modules
- **Cohérence** : Style uniforme dans toute l'application
- **Traçabilité** : Logs des actions importantes