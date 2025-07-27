import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Client, Equipment, ClientFormData, EquipmentFormData, Building, BuildingFormData } from '@/types';

export interface StockItem {
  id: string;
  type: 'cle' | 'badge' | 'telecommande';
  numero: string;
  description?: string;
  statut: 'disponible' | 'attribue' | 'perdu';
  clientActuel?: string;
  batimentId: string;
  quantite: number;
  quantiteDisponible: number;
}

// Types locaux simplifiés
interface InspectionItem {
  id: string;
  name: string;
  comment: string;
  photos: string[];
  status: 'good' | 'damaged' | 'missing' | 'needs_attention';
}

interface Inspection {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  buildingId?: string;
  buildingCode?: string;
  type: 'entry' | 'exit';
  entryInspectionId?: string;
  date: string;
  items: {
    prises: InspectionItem;
    murs: InspectionItem;
    sol: InspectionItem;
    plafond: InspectionItem;
    fenetres: InspectionItem;
    portes: InspectionItem;
  };
  signature: string;
  siteManagerName?: string;
  siteManagerSignature?: string;
  completed: boolean;
}

interface Store {
  clients: Client[];
  buildings: Building[];
  stockItems: StockItem[];
  inspections: Inspection[];
  currentInspection: Inspection | null;
  currentBuildingId: string | null;
  searchTerm: string;
  
  // Building Actions
  addBuilding: (buildingData: BuildingFormData) => void;
  updateBuilding: (id: string, buildingData: Partial<Building>) => void;
  deleteBuilding: (id: string) => void;
  setCurrentBuilding: (buildingId: string | null) => void;
  getCurrentBuilding: () => Building | undefined;
  
  // Stock Actions
  addStockItem: (itemData: Omit<StockItem, 'id'>) => void;
  updateStockItem: (id: string, itemData: Partial<StockItem>) => void;
  deleteStockItem: (id: string) => void;
  getStockItems: () => StockItem[];
  
  // Client Actions
  addClient: (clientData: ClientFormData) => void;
  updateClient: (id: string, clientData: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  addEquipment: (data: EquipmentFormData) => void;
  updateEquipmentStatus: (clientId: string, equipmentId: string, status: Equipment['statut'], dateRestitution?: string) => void;
  deleteEquipment: (clientId: string, equipmentId: string) => void;
  validateEquipment: (clientId: string, equipmentId: string, nomClient: string, signature?: string) => void;
  
  setSearchTerm: (term: string) => void;
  getFilteredClients: () => Client[];
  getClientById: (id: string) => Client | undefined;
  getEquipmentStats: () => {
    total: number;
    remis: number;
    restitue: number;
    perdu: number;
    nonRendu: number;
  };

  // Inspection Actions
  createInspection: (clientId: string, clientName: string, clientEmail: string, type: 'entry' | 'exit', buildingId?: string, entryInspectionId?: string) => void;
  updateInspectionItem: (areaKey: string, updates: Partial<InspectionItem>) => void;
  addPhotoToItem: (areaKey: string, photo: string) => void;
  removePhotoFromItem: (areaKey: string, photoIndex: number) => void;
  setSignature: (signature: string) => void;
  setSiteManagerInfo: (name: string, signature: string) => void;
  setCurrentInspection: (inspection: Inspection | null) => void;
  deleteInspection: (id: string) => void;
  completeInspection: () => void;
}

const generateId = () => crypto.randomUUID();

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      clients: [],
      stockItems: [
        { id: generateId(), type: 'cle', numero: 'K001', description: 'Clé bureau A1', statut: 'disponible', batimentId: '', quantite: 3, quantiteDisponible: 2 },
        { id: generateId(), type: 'cle', numero: 'K002', description: 'Clé bureau A2', statut: 'disponible', batimentId: '', quantite: 2, quantiteDisponible: 1 },
        { id: generateId(), type: 'badge', numero: 'B001', description: 'Badge accès principal', statut: 'disponible', batimentId: '', quantite: 1, quantiteDisponible: 1 },
        { id: generateId(), type: 'badge', numero: 'B002', description: 'Badge accès principal', statut: 'attribue', clientActuel: 'Marie Martin', batimentId: '', quantite: 1, quantiteDisponible: 0 },
        { id: generateId(), type: 'telecommande', numero: 'T001', description: 'Télécommande portail', statut: 'disponible', batimentId: '', quantite: 1, quantiteDisponible: 1 },
        { id: generateId(), type: 'telecommande', numero: 'T002', description: 'Télécommande portail', statut: 'perdu', batimentId: '', quantite: 1, quantiteDisponible: 0 },
      ],
      buildings: [
        { id: generateId(), nom: 'BEL AIR BUSINESS', code: 'BEL-BUS', dateCreation: new Date().toISOString(), description: 'Bâtiment dédié aux bureaux et espaces de travail' },
        { id: generateId(), nom: 'BEL AIR INDUSTRY', code: 'BEL-IND', dateCreation: new Date().toISOString(), description: 'Bâtiment industriel et de production' },
        { id: generateId(), nom: 'BEL AIR TEXTILE', code: 'BEL-TEX', dateCreation: new Date().toISOString(), description: 'Bâtiment spécialisé dans l\'industrie textile' },
        { id: generateId(), nom: 'BEL AIR SCHOOL', code: 'BEL-EDU', dateCreation: new Date().toISOString(), description: 'Bâtiment scolaire et de formation' },
      ],
      inspections: [],
      currentInspection: null,
      currentBuildingId: null,
      searchTerm: '',
      
      // Building Actions
      addBuilding: (buildingData) => {
        const newBuilding: Building = {
          id: generateId(),
          ...buildingData,
          dateCreation: new Date().toISOString(),
        };
        
        set((state) => ({
          buildings: [...state.buildings, newBuilding],
        }));
      },
      
      updateBuilding: (id, buildingData) => {
        set((state) => ({
          buildings: state.buildings.map((building) =>
            building.id === id ? { ...building, ...buildingData } : building
          ),
        }));
      },
      
      deleteBuilding: (id) => {
        set((state) => ({
          buildings: state.buildings.filter((building) => building.id !== id),
          // Supprimer les équipements du bâtiment supprimé
          clients: state.clients.map((client) => ({
            ...client,
            equipements: client.equipements.filter((eq) => eq.batimentId !== id),
          })),
        }));
      },
      
      setCurrentBuilding: (buildingId) => {
        set({ currentBuildingId: buildingId });
      },
      
      getCurrentBuilding: () => {
        const { buildings, currentBuildingId } = get();
        return buildings.find((building) => building.id === currentBuildingId);
      },
      
      // Stock Actions
      addStockItem: (itemData) => {
        const newStockItem: StockItem = {
          id: generateId(),
          ...itemData,
        };
        
        set((state) => ({
          stockItems: [...state.stockItems, newStockItem],
        }));
      },
      
      updateStockItem: (id, itemData) => {
        set((state) => ({
          stockItems: state.stockItems.map((item) =>
            item.id === id ? { ...item, ...itemData } : item
          ),
        }));
      },
      
      deleteStockItem: (id) => {
        set((state) => ({
          stockItems: state.stockItems.filter((item) => item.id !== id),
        }));
      },
      
      getStockItems: () => {
        return get().stockItems;
      },
      
      addClient: (clientData) => {
        const newClient: Client = {
          id: generateId(),
          ...clientData,
          dateInscription: new Date().toISOString(),
          equipements: [],
        };
        
        set((state) => ({
          clients: [...state.clients, newClient],
        }));
      },
      
      updateClient: (id, clientData) => {
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === id ? { ...client, ...clientData } : client
          ),
        }));
      },
      
      deleteClient: (id) => {
        set((state) => ({
          clients: state.clients.filter((client) => client.id !== id),
        }));
      },
      
      addEquipment: (data) => {
        const newEquipment: Equipment = {
          id: generateId(),
          type: data.equipmentType,
          numero: data.numero,
          description: data.description,
          statut: 'remis',
          batimentId: data.batimentId,
          dateRemise: new Date().toISOString(),
        };
        
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === data.clientId
              ? {
                  ...client,
                  equipements: [...client.equipements, newEquipment],
                }
              : client
          ),
        }));
      },
      
      updateEquipmentStatus: (clientId, equipmentId, status, dateRestitution) => {
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === clientId
              ? {
                  ...client,
                  equipements: client.equipements.map((eq) =>
                    eq.id === equipmentId
                      ? {
                          ...eq,
                          statut: status,
                          dateRestitution: status === 'restitue' ? (dateRestitution || new Date().toISOString()) : eq.dateRestitution,
                        }
                      : eq
                  ),
                }
              : client
          ),
        }));
      },
      
      deleteEquipment: (clientId, equipmentId) => {
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === clientId
              ? {
                  ...client,
                  equipements: client.equipements.filter((eq) => eq.id !== equipmentId),
                }
              : client
          ),
        }));
      },
      
      validateEquipment: (clientId, equipmentId, nomClient, signature) => {
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === clientId
              ? {
                  ...client,
                  equipements: client.equipements.map((eq) =>
                    eq.id === equipmentId
                      ? {
                          ...eq,
                          validationClient: {
                            nomClient,
                            dateValidation: new Date().toISOString(),
                            confirme: true,
                            signature,
                          },
                        }
                      : eq
                  ),
                }
              : client
          ),
        }));
      },
      
      setSearchTerm: (term) => {
        set({ searchTerm: term });
      },
      
      getFilteredClients: () => {
        const { clients, searchTerm, currentBuildingId } = get();
        let filteredClients = currentBuildingId 
          ? clients.filter((client) => 
              client.equipements.some((eq) => eq.batimentId === currentBuildingId)
            )
          : clients;
        
        if (!searchTerm) return filteredClients;
        
        const term = searchTerm.toLowerCase();
        return filteredClients.filter((client) =>
          client.nom.toLowerCase().includes(term) ||
          client.prenom.toLowerCase().includes(term) ||
          client.email.toLowerCase().includes(term) ||
          client.telephone.includes(term) ||
          client.equipements.some((eq) =>
            eq.type.toLowerCase().includes(term) ||
            eq.numero?.toLowerCase().includes(term) ||
            eq.description?.toLowerCase().includes(term)
          )
        );
      },
      
      getClientById: (id) => {
        return get().clients.find((client) => client.id === id);
      },
      
      getEquipmentStats: () => {
        const { clients, currentBuildingId } = get();
        const allEquipments = clients.flatMap((client) => client.equipements);
        const filteredEquipments = currentBuildingId 
          ? allEquipments.filter((eq) => eq.batimentId === currentBuildingId)
          : allEquipments;
        
        return {
          total: filteredEquipments.length,
          remis: filteredEquipments.filter((eq) => eq.statut === 'remis').length,
          restitue: filteredEquipments.filter((eq) => eq.statut === 'restitue').length,
          perdu: filteredEquipments.filter((eq) => eq.statut === 'perdu').length,
          nonRendu: filteredEquipments.filter((eq) => eq.statut === 'non_rendu').length,
        };
      },

      // Inspection Actions
      createInspection: (clientId, clientName, clientEmail, type, buildingId, entryInspectionId) => {
        const building = get().buildings.find(b => b.id === buildingId);
        
        const createEmptyInspectionItem = (name: string): InspectionItem => ({
          id: generateId(),
          name,
          comment: '',
          photos: [],
          status: 'good'
        });

        const newInspection: Inspection = {
          id: generateId(),
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

      removePhotoFromItem: (areaKey, photoIndex) => {
        set(state => {
          if (!state.currentInspection) return state;
          
          const currentItem = state.currentInspection.items[areaKey as keyof typeof state.currentInspection.items];
          const updatedPhotos = currentItem.photos.filter((_, index) => index !== photoIndex);
          
          return {
            currentInspection: {
              ...state.currentInspection,
              items: {
                ...state.currentInspection.items,
                [areaKey]: {
                  ...currentItem,
                  photos: updatedPhotos
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

      setCurrentInspection: (inspection) => {
        set({ currentInspection: inspection });
      },

      deleteInspection: (id) => {
        set(state => ({
          inspections: state.inspections.filter(i => i.id !== id),
          currentInspection: state.currentInspection?.id === id ? null : state.currentInspection
        }));
      },

      completeInspection: () => {
        const { currentInspection } = get();
        if (!currentInspection) return;

        const completedInspection = {
          ...currentInspection,
          completed: true
        };

        set(state => ({
          inspections: [completedInspection, ...state.inspections],
          currentInspection: null
        }));
      }
    }),
    {
      name: 'coworking-equipment-store',
    }
  )
);