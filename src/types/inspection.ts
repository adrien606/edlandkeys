export interface InspectionBuilding {
  id: string;
  nom: string;
  code: string;
  adresse?: string;
  description?: string;
  dateCreation: string;
}

export interface InspectionItem {
  id: string;
  name: string;
  comment: string;
  photos: string[]; // Base64 encoded images
  status: 'good' | 'damaged' | 'missing' | 'needs_attention';
}

export interface Inspection {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  buildingId?: string;
  buildingCode?: string;
  type: 'entry' | 'exit';
  date: string;
  items: {
    prises: InspectionItem;
    murs: InspectionItem;
    sol: InspectionItem;
    plafond: InspectionItem;
    fenetres: InspectionItem;
    portes: InspectionItem;
  };
  signature: string; // Base64 encoded signature
  completed: boolean;
  pdfGenerated?: boolean;
  emailSent?: boolean;
}

export const INSPECTION_AREAS = [
  { key: 'prises', label: 'Prises électriques' },
  { key: 'murs', label: 'Murs' },
  { key: 'sol', label: 'Sol' },
  { key: 'plafond', label: 'Plafond' },
  { key: 'fenetres', label: 'Fenêtres' },
  { key: 'portes', label: 'Portes' }
] as const;