import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Inspection, InspectionItem, InspectionBuilding } from '@/types/inspection';

interface InspectionStore {
  inspections: Inspection[];
  currentInspection: Inspection | null;
  inspectionBuildings: InspectionBuilding[];
  
  // Actions
  createInspection: (clientId: string, clientName: string, clientEmail: string, type: 'entry' | 'exit', buildingId?: string, entryInspectionId?: string) => void;
  updateInspectionItem: (itemKey: keyof Inspection['items'], data: Partial<InspectionItem>) => void;
  addPhotoToItem: (itemKey: keyof Inspection['items'], photo: string) => void;
  removePhotoFromItem: (itemKey: keyof Inspection['items'], photoIndex: number) => void;
  setSignature: (signature: string) => void;
  setSiteManagerData: (name: string, signature: string) => void;
  completeInspection: () => void;
  getInspectionsByClient: (clientId: string) => Inspection[];
  setCurrentInspection: (inspection: Inspection | null) => void;
  setInspectionBuilding: (buildingId: string) => void;
  deleteInspection: (inspectionId: string) => void;
  
  // Building management
  addInspectionBuilding: (building: Omit<InspectionBuilding, 'id' | 'dateCreation'>) => void;
  updateInspectionBuilding: (id: string, building: Partial<InspectionBuilding>) => void;
  deleteInspectionBuilding: (id: string) => void;
  getInspectionBuildingById: (id: string) => InspectionBuilding | undefined;
}

const createEmptyInspectionItem = (name: string): InspectionItem => ({
  id: Math.random().toString(36).substr(2, 9),
  name,
  comment: '',
  photos: [],
  status: 'good'
});

export const useInspectionStore = create<InspectionStore>()(
  persist(
    (set, get) => ({
      inspections: [],
      currentInspection: null,
      inspectionBuildings: [
        {
          id: '1',
          nom: 'Bâtiment A',
          code: 'BAT-A',
          adresse: '123 Rue Example',
          description: 'Bâtiment principal',
          dateCreation: new Date().toISOString()
        },
        {
          id: '2',
          nom: 'Bâtiment B',
          code: 'BAT-B',
          adresse: '456 Avenue Test',
          description: 'Bâtiment secondaire',
          dateCreation: new Date().toISOString()
        }
      ],

      createInspection: (clientId, clientName, clientEmail, type, buildingId, entryInspectionId) => {
        const building = buildingId ? get().inspectionBuildings.find(b => b.id === buildingId) : undefined;
        
        const newInspection: Inspection = {
          id: Math.random().toString(36).substr(2, 9),
          clientId,
          clientName,
          clientEmail,
          buildingId,
          buildingCode: building?.code,
          type,
          entryInspectionId: type === 'exit' ? entryInspectionId : undefined,
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

      updateInspectionItem: (itemKey, data) => {
        const { currentInspection } = get();
        if (!currentInspection) return;

        const updatedInspection = {
          ...currentInspection,
          items: {
            ...currentInspection.items,
            [itemKey]: {
              ...currentInspection.items[itemKey],
              ...data
            }
          }
        };

        set({ currentInspection: updatedInspection });
      },

      addPhotoToItem: (itemKey, photo) => {
        const { currentInspection } = get();
        if (!currentInspection) return;

        const updatedInspection = {
          ...currentInspection,
          items: {
            ...currentInspection.items,
            [itemKey]: {
              ...currentInspection.items[itemKey],
              photos: [...currentInspection.items[itemKey].photos, photo]
            }
          }
        };

        set({ currentInspection: updatedInspection });
      },

      removePhotoFromItem: (itemKey, photoIndex) => {
        const { currentInspection } = get();
        if (!currentInspection) return;

        const updatedInspection = {
          ...currentInspection,
          items: {
            ...currentInspection.items,
            [itemKey]: {
              ...currentInspection.items[itemKey],
              photos: currentInspection.items[itemKey].photos.filter((_, index) => index !== photoIndex)
            }
          }
        };

        set({ currentInspection: updatedInspection });
      },

      setSignature: (signature) => {
        const { currentInspection } = get();
        if (!currentInspection) return;

        set({
          currentInspection: {
            ...currentInspection,
            signature
          }
        });
      },

      setSiteManagerData: (name, signature) => {
        const { currentInspection } = get();
        if (!currentInspection) return;

        set({
          currentInspection: {
            ...currentInspection,
            siteManagerName: name,
            siteManagerSignature: signature
          }
        });
      },

      completeInspection: () => {
        const { currentInspection, inspections } = get();
        if (!currentInspection) return;

        const completedInspection = {
          ...currentInspection,
          completed: true
        };

        set({
          inspections: [...inspections, completedInspection],
          currentInspection: null
        });
      },

      getInspectionsByClient: (clientId) => {
        return get().inspections.filter(inspection => inspection.clientId === clientId);
      },

      setCurrentInspection: (inspection) => {
        set({ currentInspection: inspection });
      },

      setInspectionBuilding: (buildingId) => {
        const { currentInspection, inspectionBuildings } = get();
        if (!currentInspection) return;

        const building = inspectionBuildings.find(b => b.id === buildingId);
        
        set({
          currentInspection: {
            ...currentInspection,
            buildingId,
            buildingCode: building?.code
          }
        });
      },

      addInspectionBuilding: (building) => {
        const newBuilding: InspectionBuilding = {
          ...building,
          id: Math.random().toString(36).substr(2, 9),
          dateCreation: new Date().toISOString()
        };

        set(state => ({
          inspectionBuildings: [...state.inspectionBuildings, newBuilding]
        }));
      },

      updateInspectionBuilding: (id, buildingData) => {
        set(state => ({
          inspectionBuildings: state.inspectionBuildings.map(building =>
            building.id === id ? { ...building, ...buildingData } : building
          )
        }));
      },

      deleteInspectionBuilding: (id) => {
        console.log('Store: Suppression du bâtiment avec ID:', id);
        console.log('Store: Bâtiments avant suppression:', get().inspectionBuildings);
        set(state => {
          const newBuildings = state.inspectionBuildings.filter(building => building.id !== id);
          console.log('Store: Bâtiments après suppression:', newBuildings);
          return { inspectionBuildings: newBuildings };
        });
      },

      getInspectionBuildingById: (id) => {
        return get().inspectionBuildings.find(building => building.id === id);
      },

      deleteInspection: (inspectionId) => {
        set(state => ({
          inspections: state.inspections.filter(inspection => inspection.id !== inspectionId)
        }));
      }
    }),
    {
      name: 'inspection-storage'
    }
  )
);