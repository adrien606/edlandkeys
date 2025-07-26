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
  dateRemise?: string;
  dateRestitution?: string;
  validationClient?: {
    nomClient: string;
    dateValidation: string;
    confirme: boolean;
  };
}

export interface EquipmentFormData {
  clientId: string;
  equipmentType: 'cle' | 'badge' | 'telecommande';
  numero?: string;
  description?: string;
}

export interface ClientFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}