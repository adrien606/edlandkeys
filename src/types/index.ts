export interface Building {
  id: string;
  nom: string;
  code: string;
  description?: string;
  dateCreation: string;
}

export interface Client {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateInscription: string;
  equipements: Equipment[];
}

export interface Equipment {
  id: string;
  type: 'cle' | 'badge' | 'telecommande';
  numero?: string;
  description?: string;
  statut: 'remis' | 'restitue' | 'perdu' | 'non_rendu';
  batimentId: string;
  dateRemise?: string;
  dateRestitution?: string;
  validationClient?: {
    nomClient: string;
    dateValidation: string;
    confirme: boolean;
    signature?: string;
  };
}

export interface EquipmentFormData {
  clientId: string;
  equipmentType: 'cle' | 'badge' | 'telecommande';
  numero?: string;
  description?: string;
  batimentId: string;
}

export interface ClientFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

export interface BuildingFormData {
  nom: string;
  code: string;
  description?: string;
}