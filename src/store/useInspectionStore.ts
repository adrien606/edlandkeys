import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Inspection, InspectionItem } from '@/types/inspection';

interface InspectionStore {
  inspections: Inspection[];
  currentInspection: Inspection | null;
  
  // Actions
  createInspection: (clientId: string, clientName: string, clientEmail: string, type: 'entry' | 'exit') => void;
  updateInspectionItem: (itemKey: keyof Inspection['items'], data: Partial<InspectionItem>) => void;
  addPhotoToItem: (itemKey: keyof Inspection['items'], photo: string) => void;
  removePhotoFromItem: (itemKey: keyof Inspection['items'], photoIndex: number) => void;
  setSignature: (signature: string) => void;
  completeInspection: () => void;
  getInspectionsByClient: (clientId: string) => Inspection[];
  setCurrentInspection: (inspection: Inspection | null) => void;
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

      createInspection: (clientId, clientName, clientEmail, type) => {
        const newInspection: Inspection = {
          id: Math.random().toString(36).substr(2, 9),
          clientId,
          clientName,
          clientEmail,
          type,
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
      }
    }),
    {
      name: 'inspection-storage'
    }
  )
);