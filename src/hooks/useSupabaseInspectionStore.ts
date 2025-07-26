import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Inspection, InspectionBuilding, InspectionItem, INSPECTION_AREAS } from '@/types/inspection';

interface SupabaseInspectionStore {
  inspections: Inspection[];
  currentInspection: Inspection | null;
  inspectionBuildings: InspectionBuilding[];
  loading: boolean;
  
  loadData: () => Promise<void>;
  createInspection: (
    clientId: string,
    clientName: string,
    clientEmail: string,
    type: 'entry' | 'exit',
    buildingId?: string,
    entryInspectionId?: string
  ) => void;
  updateInspectionItem: (areaKey: string, updates: Partial<InspectionItem>) => void;
  addPhotoToItem: (areaKey: string, photo: string) => void;
  setSignature: (signature: string) => void;
  setSiteManagerInfo: (name: string, signature: string) => void;
  completeInspection: () => Promise<void>;
  addInspectionBuilding: (building: Omit<InspectionBuilding, 'id' | 'dateCreation'>) => Promise<void>;
  updateInspectionBuilding: (id: string, updates: Partial<InspectionBuilding>) => Promise<void>;
}

const createEmptyInspectionItem = (name: string): InspectionItem => ({
  id: crypto.randomUUID(),
  name,
  comment: '',
  photos: [],
  status: 'good'
});

export const useSupabaseInspectionStore = create<SupabaseInspectionStore>((set, get) => ({
  inspections: [],
  currentInspection: null,
  inspectionBuildings: [],
  loading: false,

  loadData: async () => {
    set({ loading: true });
    
    try {
      // Load inspection buildings
      const { data: buildingsData } = await supabase
        .from('inspection_buildings')
        .select('*')
        .order('nom');
      
      // Load inspections
      const { data: inspectionsData } = await supabase
        .from('inspections')
        .select('*')
        .order('date', { ascending: false });
      
      const inspectionBuildings: InspectionBuilding[] = (buildingsData || []).map(b => ({
        id: b.id,
        nom: b.nom,
        code: b.code,
        adresse: b.adresse,
        description: b.description,
        dateCreation: b.date_creation
      }));
      
      const inspections: Inspection[] = (inspectionsData || []).map(i => ({
        id: i.id,
        clientId: i.client_id,
        clientName: i.client_name,
        clientEmail: i.client_email,
        buildingId: i.building_id,
        buildingCode: i.building_code,
        type: i.type as 'entry' | 'exit',
        entryInspectionId: i.entry_inspection_id,
        date: i.date,
        items: i.items as any,
        signature: i.signature || '',
        siteManagerName: i.site_manager_name,
        siteManagerSignature: i.site_manager_signature,
        completed: i.completed,
        pdfGenerated: i.pdf_generated,
        emailSent: i.email_sent
      }));
      
      set({ 
        inspectionBuildings,
        inspections,
        loading: false 
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'inspection:', error);
      set({ loading: false });
    }
  },

  createInspection: (clientId, clientName, clientEmail, type, buildingId, entryInspectionId) => {
    const building = get().inspectionBuildings.find(b => b.id === buildingId);
    
    const newInspection: Inspection = {
      id: crypto.randomUUID(),
      clientId,
      clientName,
      clientEmail,
      buildingId,
      buildingCode: building?.code,
      type,
      entryInspectionId,
      date: new Date().toISOString(),
      items: {
        prises: createEmptyInspectionItem('Prises électriques'),
        murs: createEmptyInspectionItem('Murs'),
        sol: createEmptyInspectionItem('Sol'),
        plafond: createEmptyInspectionItem('Plafond'),
        fenetres: createEmptyInspectionItem('Fenêtres'),
        portes: createEmptyInspectionItem('Portes')
      },
      signature: '',
      completed: false
    };
    
    set({ currentInspection: newInspection });
  },

  updateInspectionItem: (areaKey, updates) => {
    set(state => {
      if (!state.currentInspection) return state;
      
      return {
        currentInspection: {
          ...state.currentInspection,
          items: {
            ...state.currentInspection.items,
            [areaKey]: {
              ...state.currentInspection.items[areaKey as keyof typeof state.currentInspection.items],
              ...updates
            }
          }
        }
      };
    });
  },

  addPhotoToItem: (areaKey, photo) => {
    set(state => {
      if (!state.currentInspection) return state;
      
      const currentItem = state.currentInspection.items[areaKey as keyof typeof state.currentInspection.items];
      
      return {
        currentInspection: {
          ...state.currentInspection,
          items: {
            ...state.currentInspection.items,
            [areaKey]: {
              ...currentItem,
              photos: [...currentItem.photos, photo]
            }
          }
        }
      };
    });
  },

  setSignature: (signature) => {
    set(state => ({
      currentInspection: state.currentInspection ? {
        ...state.currentInspection,
        signature
      } : null
    }));
  },

  setSiteManagerInfo: (name, signature) => {
    set(state => ({
      currentInspection: state.currentInspection ? {
        ...state.currentInspection,
        siteManagerName: name,
        siteManagerSignature: signature
      } : null
    }));
  },

  completeInspection: async () => {
    const { currentInspection } = get();
    if (!currentInspection) return;

    const completedInspection = {
      ...currentInspection,
      completed: true
    };

    try {
      // Save to Supabase
      const { error } = await supabase
        .from('inspections')
        .insert({
          client_id: completedInspection.clientId,
          client_name: completedInspection.clientName,
          client_email: completedInspection.clientEmail,
          building_id: completedInspection.buildingId,
          building_code: completedInspection.buildingCode,
          type: completedInspection.type,
          entry_inspection_id: completedInspection.entryInspectionId,
          date: completedInspection.date,
          items: completedInspection.items as any,
          signature: completedInspection.signature,
          site_manager_name: completedInspection.siteManagerName,
          site_manager_signature: completedInspection.siteManagerSignature,
          completed: completedInspection.completed,
          pdf_generated: completedInspection.pdfGenerated || false,
          email_sent: completedInspection.emailSent || false
        });

      if (error) throw error;

      set(state => ({
        inspections: [completedInspection, ...state.inspections],
        currentInspection: null
      }));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'inspection:', error);
    }
  },

  addInspectionBuilding: async (building) => {
    const { data: newBuilding, error } = await supabase
      .from('inspection_buildings')
      .insert({
        nom: building.nom,
        code: building.code,
        adresse: building.adresse,
        description: building.description
      })
      .select()
      .single();

    if (error) throw error;

    const inspectionBuilding: InspectionBuilding = {
      id: newBuilding.id,
      nom: newBuilding.nom,
      code: newBuilding.code,
      adresse: newBuilding.adresse,
      description: newBuilding.description,
      dateCreation: newBuilding.date_creation
    };

    set(state => ({
      inspectionBuildings: [...state.inspectionBuildings, inspectionBuilding]
    }));
  },

  updateInspectionBuilding: async (id, updates) => {
    const updateData: any = {};
    if (updates.nom) updateData.nom = updates.nom;
    if (updates.code) updateData.code = updates.code;
    if (updates.adresse !== undefined) updateData.adresse = updates.adresse;
    if (updates.description !== undefined) updateData.description = updates.description;

    const { error } = await supabase
      .from('inspection_buildings')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    set(state => ({
      inspectionBuildings: state.inspectionBuildings.map(b =>
        b.id === id ? { ...b, ...updates } : b
      )
    }));
  }
}));