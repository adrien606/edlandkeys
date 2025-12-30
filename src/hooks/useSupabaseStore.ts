import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { Client, Equipment, ClientFormData, EquipmentFormData, Building, BuildingFormData } from '@/types';

export interface StockItem {
  id: string;
  type: 'cle' | 'badge' | 'telecommande';
  numero: string;
  description?: string;
  statut: 'disponible' | 'attribue' | 'perdu';
  client_actuel?: string;
  batiment_id: string;
  quantite: number;
  quantite_disponible: number;
  created_at?: string;
  updated_at?: string;
}

interface InspectionItem {
  id: string;
  name: string;
  comment: string;
  photos: string[];
  status: 'good' | 'damaged' | 'missing' | 'needs_attention';
}

interface Inspection {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  building_id?: string;
  building_code?: string;
  type: 'entry' | 'exit';
  entry_inspection_id?: string;
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
  site_manager_name?: string;
  site_manager_signature?: string;
  completed: boolean;
  pdf_generated?: boolean;
  email_sent?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface SupabaseStore {
  clients: Client[];
  buildings: Building[];
  stockItems: StockItem[];
  inspections: Inspection[];
  currentInspection: Inspection | null;
  currentBuildingId: string | null;
  searchTerm: string;
  isOnline: boolean;
  syncPending: boolean;
  
  // Network status
  setOnlineStatus: (status: boolean) => void;
  
  // Sync functions
  syncToSupabase: () => Promise<void>;
  syncFromSupabase: () => Promise<void>;
  
  // Building Actions
  addBuilding: (buildingData: BuildingFormData) => Promise<void>;
  updateBuilding: (id: string, buildingData: Partial<Building>) => Promise<void>;
  deleteBuilding: (id: string) => Promise<void>;
  setCurrentBuilding: (buildingId: string | null) => void;
  getCurrentBuilding: () => Building | undefined;
  
  // Stock Actions
  addStockItem: (itemData: Omit<StockItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateStockItem: (id: string, itemData: Partial<StockItem>) => Promise<void>;
  deleteStockItem: (id: string) => Promise<void>;
  getStockItems: () => StockItem[];
  
  // Client Actions
  addClient: (clientData: ClientFormData) => Promise<void>;
  updateClient: (id: string, clientData: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  
  addEquipment: (data: EquipmentFormData) => Promise<void>;
  updateEquipmentStatus: (clientId: string, equipmentId: string, status: Equipment['statut'], dateRestitution?: string) => Promise<void>;
  deleteEquipment: (clientId: string, equipmentId: string) => Promise<void>;
  validateEquipment: (clientId: string, equipmentId: string, nomClient: string, signature?: string) => Promise<void>;
  
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
  deleteInspection: (id: string) => Promise<void>;
  completeInspection: () => Promise<void>;
  
  // Initialization
  initialize: () => Promise<void>;
}

const generateId = () => crypto.randomUUID();

export const useSupabaseStore = create<SupabaseStore>()(
  persist(
    (set, get) => ({
      clients: [],
      buildings: [],
      stockItems: [],
      inspections: [],
      currentInspection: null,
      currentBuildingId: null,
      searchTerm: '',
      isOnline: navigator.onLine,
      syncPending: false,

      setOnlineStatus: (status) => {
        set({ isOnline: status });
        if (status) {
          // Auto-sync when coming back online
          get().syncFromSupabase();
        }
      },

      initialize: async () => {
        const store = get();
        
        // Listen for online/offline events
        window.addEventListener('online', () => store.setOnlineStatus(true));
        window.addEventListener('offline', () => store.setOnlineStatus(false));
        
        // Initial sync if online
        if (store.isOnline) {
          await store.syncFromSupabase();
        }
      },

      syncFromSupabase: async () => {
        if (!get().isOnline) return;
        
        try {
          set({ syncPending: true });
          
          // Sync buildings
          const { data: buildings, error: buildingsError } = await supabase
            .from('buildings')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (buildingsError) throw buildingsError;

          // Sync clients
          const { data: clients, error: clientsError } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (clientsError) throw clientsError;

          // Sync equipment
          const { data: equipment, error: equipmentError } = await supabase
            .from('equipment')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (equipmentError) throw equipmentError;

          // Sync stock items
          const { data: stockItems, error: stockError } = await supabase
            .from('stock_items')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (stockError) throw stockError;

          // Sync inspections
          const { data: inspections, error: inspectionsError } = await supabase
            .from('inspections')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (inspectionsError) throw inspectionsError;

          // Transform and merge data
          const transformedClients: Client[] = clients?.map(client => ({
            id: client.id,
            nom: client.nom,
            prenom: client.prenom,
            email: client.email,
            telephone: client.telephone,
            dateInscription: client.date_inscription || client.created_at,
            equipements: equipment?.filter(eq => eq.client_id === client.id).map(eq => ({
              id: eq.id,
              type: eq.type as 'cle' | 'badge' | 'telecommande',
              numero: eq.numero,
              description: eq.description,
              statut: eq.statut as Equipment['statut'],
              batimentId: eq.batiment_id,
              dateRemise: eq.date_remise,
              dateRestitution: eq.date_restitution,
              validationClient: eq.validation_client
            })) || []
          })) || [];

          const transformedBuildings: Building[] = buildings?.map(building => ({
            id: building.id,
            nom: building.nom,
            code: building.code,
            description: building.description,
            dateCreation: building.date_creation || building.created_at
          })) || [];

          const transformedStockItems: StockItem[] = stockItems?.map(item => ({
            id: item.id,
            type: item.type as 'cle' | 'badge' | 'telecommande',
            numero: item.numero,
            description: item.description,
            statut: item.statut as 'disponible' | 'attribue' | 'perdu',
            client_actuel: item.client_actuel,
            batiment_id: item.batiment_id,
            quantite: item.quantite,
            quantite_disponible: item.quantite_disponible,
            created_at: item.created_at,
            updated_at: item.updated_at
          })) || [];

          const transformedInspections: Inspection[] = inspections?.map(inspection => ({
            id: inspection.id,
            client_id: inspection.client_id,
            client_name: inspection.client_name,
            client_email: inspection.client_email,
            building_id: inspection.building_id,
            building_code: inspection.building_code,
            type: inspection.type as 'entry' | 'exit',
            entry_inspection_id: inspection.entry_inspection_id,
            date: inspection.date,
            items: inspection.items,
            signature: inspection.signature || '',
            site_manager_name: inspection.site_manager_name,
            site_manager_signature: inspection.site_manager_signature,
            completed: inspection.completed || false,
            pdf_generated: inspection.pdf_generated || false,
            email_sent: inspection.email_sent || false,
            created_at: inspection.created_at,
            updated_at: inspection.updated_at
          })) || [];

          set({
            clients: transformedClients,
            buildings: transformedBuildings,
            stockItems: transformedStockItems,
            inspections: transformedInspections,
            syncPending: false
          });

        } catch (error) {
          console.error('Sync from Supabase failed:', error);
          set({ syncPending: false });
        }
      },

      syncToSupabase: async () => {
        if (!get().isOnline) return;
        // Implementation for syncing local changes to Supabase
        // This would be used for offline changes that need to be pushed
      },

      // Building Actions
      addBuilding: async (buildingData) => {
        const newBuilding: Building = {
          id: generateId(),
          ...buildingData,
          dateCreation: new Date().toISOString(),
        };

        // Update local state immediately
        set((state) => ({
          buildings: [...state.buildings, newBuilding],
        }));

        // Sync to Supabase if online
        if (get().isOnline) {
          try {
            const { error } = await supabase
              .from('buildings')
              .insert({
                id: newBuilding.id,
                nom: newBuilding.nom,
                code: newBuilding.code,
                description: newBuilding.description,
                date_creation: newBuilding.dateCreation
              });

            if (error) throw error;
          } catch (error) {
            console.error('Failed to sync building to Supabase:', error);
          }
        }
      },

      updateBuilding: async (id, buildingData) => {
        set((state) => ({
          buildings: state.buildings.map((building) =>
            building.id === id ? { ...building, ...buildingData } : building
          ),
        }));

        if (get().isOnline) {
          try {
            const { error } = await supabase
              .from('buildings')
              .update({
                nom: buildingData.nom,
                code: buildingData.code,
                description: buildingData.description
              })
              .eq('id', id);

            if (error) throw error;
          } catch (error) {
            console.error('Failed to update building in Supabase:', error);
          }
        }
      },

      deleteBuilding: async (id) => {
        set((state) => ({
          buildings: state.buildings.filter((building) => building.id !== id),
          clients: state.clients.map((client) => ({
            ...client,
            equipements: client.equipements.filter((eq) => eq.batimentId !== id),
          })),
        }));

        if (get().isOnline) {
          try {
            const { error } = await supabase
              .from('buildings')
              .delete()
              .eq('id', id);

            if (error) throw error;
          } catch (error) {
            console.error('Failed to delete building from Supabase:', error);
          }
        }
      },

      setCurrentBuilding: (buildingId) => {
        set({ currentBuildingId: buildingId });
      },

      getCurrentBuilding: () => {
        const { buildings, currentBuildingId } = get();
        return buildings.find((building) => building.id === currentBuildingId);
      },

      // Stock Actions
      addStockItem: async (itemData) => {
        const newStockItem: StockItem = {
          id: generateId(),
          ...itemData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        set((state) => ({
          stockItems: [...state.stockItems, newStockItem],
        }));

        if (get().isOnline) {
          try {
            const { error } = await supabase
              .from('stock_items')
              .insert({
                id: newStockItem.id,
                type: newStockItem.type,
                numero: newStockItem.numero,
                description: newStockItem.description,
                statut: newStockItem.statut,
                client_actuel: newStockItem.client_actuel,
                batiment_id: newStockItem.batiment_id,
                quantite: newStockItem.quantite,
                quantite_disponible: newStockItem.quantite_disponible
              });

            if (error) throw error;
          } catch (error) {
            console.error('Failed to sync stock item to Supabase:', error);
          }
        }
      },

      updateStockItem: async (id, itemData) => {
        set((state) => ({
          stockItems: state.stockItems.map((item) =>
            item.id === id ? { ...item, ...itemData, updated_at: new Date().toISOString() } : item
          ),
        }));

        if (get().isOnline) {
          try {
            const { error } = await supabase
              .from('stock_items')
              .update(itemData)
              .eq('id', id);

            if (error) throw error;
          } catch (error) {
            console.error('Failed to update stock item in Supabase:', error);
          }
        }
      },

      deleteStockItem: async (id) => {
        set((state) => ({
          stockItems: state.stockItems.filter((item) => item.id !== id),
        }));

        if (get().isOnline) {
          try {
            const { error } = await supabase
              .from('stock_items')
              .delete()
              .eq('id', id);

            if (error) throw error;
          } catch (error) {
            console.error('Failed to delete stock item from Supabase:', error);
          }
        }
      },

      getStockItems: () => {
        return get().stockItems;
      },

      // Client Actions
      addClient: async (clientData) => {
        console.log('addClient appelé avec:', clientData);
        
        const newClient: Client = {
          id: generateId(),
          ...clientData,
          dateInscription: new Date().toISOString(),
          equipements: [],
        };

        console.log('Nouveau client créé:', newClient);

        set((state) => ({
          clients: [...state.clients, newClient],
        }));

        console.log('État local mis à jour, isOnline:', get().isOnline);

        if (get().isOnline) {
          try {
            console.log('Tentative d\'insertion dans Supabase...');
            const { data, error } = await supabase
              .from('clients')
              .insert({
                id: newClient.id,
                nom: newClient.nom,
                prenom: newClient.prenom,
                email: newClient.email,
                telephone: newClient.telephone,
                telephone_secondaire: clientData.telephone_secondaire,
                date_inscription: newClient.dateInscription
              })
              .select();

            if (error) {
              console.error('Erreur Supabase détaillée:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
              });
              // Rollback local state
              set((state) => ({
                clients: state.clients.filter(c => c.id !== newClient.id),
              }));
              throw new Error(`Erreur de base de données: ${error.message}`);
            }
            
            console.log('Client inséré avec succès dans Supabase:', data);
          } catch (error) {
            console.error('Exception lors de l\'insertion:', error);
            throw error;
          }
        }
      },

      updateClient: async (id, clientData) => {
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === id ? { ...client, ...clientData } : client
          ),
        }));

        if (get().isOnline) {
          try {
            const { error } = await supabase
              .from('clients')
              .update(clientData)
              .eq('id', id);

            if (error) throw error;
          } catch (error) {
            console.error('Failed to update client in Supabase:', error);
          }
        }
      },

      deleteClient: async (id) => {
        set((state) => ({
          clients: state.clients.filter((client) => client.id !== id),
        }));

        if (get().isOnline) {
          try {
            const { error } = await supabase
              .from('clients')
              .delete()
              .eq('id', id);

            if (error) throw error;
          } catch (error) {
            console.error('Failed to delete client from Supabase:', error);
          }
        }
      },

      addEquipment: async (data) => {
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

        if (get().isOnline) {
          try {
            const { error } = await supabase
              .from('equipment')
              .insert({
                id: newEquipment.id,
                client_id: data.clientId,
                type: newEquipment.type,
                numero: newEquipment.numero,
                description: newEquipment.description,
                statut: newEquipment.statut,
                batiment_id: newEquipment.batimentId,
                date_remise: newEquipment.dateRemise
              });

            if (error) throw error;
          } catch (error) {
            console.error('Failed to sync equipment to Supabase:', error);
          }
        }
      },

      updateEquipmentStatus: async (clientId, equipmentId, status, dateRestitution) => {
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

        if (get().isOnline) {
          try {
            const { error } = await supabase
              .from('equipment')
              .update({
                statut: status,
                date_restitution: status === 'restitue' ? (dateRestitution || new Date().toISOString()) : null
              })
              .eq('id', equipmentId);

            if (error) throw error;
          } catch (error) {
            console.error('Failed to update equipment status in Supabase:', error);
          }
        }
      },

      deleteEquipment: async (clientId, equipmentId) => {
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

        if (get().isOnline) {
          try {
            const { error } = await supabase
              .from('equipment')
              .delete()
              .eq('id', equipmentId);

            if (error) throw error;
          } catch (error) {
            console.error('Failed to delete equipment from Supabase:', error);
          }
        }
      },

      validateEquipment: async (clientId, equipmentId, nomClient, signature) => {
        const validationData = {
          nomClient,
          dateValidation: new Date().toISOString(),
          confirme: true,
          signature,
        };

        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === clientId
              ? {
                  ...client,
                  equipements: client.equipements.map((eq) =>
                    eq.id === equipmentId
                      ? {
                          ...eq,
                          validationClient: validationData,
                        }
                      : eq
                  ),
                }
              : client
          ),
        }));

        if (get().isOnline) {
          try {
            const { error } = await supabase
              .from('equipment')
              .update({
                validation_client: validationData
              })
              .eq('id', equipmentId);

            if (error) throw error;
          } catch (error) {
            console.error('Failed to update equipment validation in Supabase:', error);
          }
        }
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
          client_id: clientId,
          client_name: clientName,
          client_email: clientEmail,
          building_id: buildingId,
          building_code: building?.code,
          type,
          entry_inspection_id: entryInspectionId,
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
            site_manager_name: name,
            site_manager_signature: signature
          } : null
        }));
      },

      setCurrentInspection: (inspection) => {
        set({ currentInspection: inspection });
      },

      deleteInspection: async (id) => {
        set(state => ({
          inspections: state.inspections.filter(i => i.id !== id),
          currentInspection: state.currentInspection?.id === id ? null : state.currentInspection
        }));

        if (get().isOnline) {
          try {
            const { error } = await supabase
              .from('inspections')
              .delete()
              .eq('id', id);

            if (error) throw error;
          } catch (error) {
            console.error('Failed to delete inspection from Supabase:', error);
          }
        }
      },

      completeInspection: async () => {
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

        if (get().isOnline) {
          try {
            const { error } = await supabase
              .from('inspections')
              .insert({
                id: completedInspection.id,
                client_id: completedInspection.client_id,
                client_name: completedInspection.client_name,
                client_email: completedInspection.client_email,
                building_id: completedInspection.building_id,
                building_code: completedInspection.building_code,
                type: completedInspection.type,
                entry_inspection_id: completedInspection.entry_inspection_id,
                date: completedInspection.date,
                items: completedInspection.items,
                signature: completedInspection.signature,
                site_manager_name: completedInspection.site_manager_name,
                site_manager_signature: completedInspection.site_manager_signature,
                completed: completedInspection.completed
              });

            if (error) throw error;
          } catch (error) {
            console.error('Failed to save inspection to Supabase:', error);
          }
        }
      }
    }),
    {
      name: 'edlandkeys-store',
      version: 4,
      // Migration pour forcer le rechargement des données depuis Supabase
      migrate: (persistedState: any, version: number) => {
        console.log('[Store] Migration from version', version, 'to 4');
        // Si la version est inférieure à 4, on efface le cache pour forcer le rechargement
        if (version < 4) {
          console.log('[Store] Clearing old cache, will reload from Supabase');
          return {
            clients: [],
            buildings: [],
            stockItems: [],
            currentBuildingId: null,
          };
        }
        return persistedState;
      },
      // Ne persister que les données essentielles pour éviter de dépasser le quota localStorage
      partialize: (state) => ({
        clients: state.clients,
        buildings: state.buildings,
        stockItems: state.stockItems,
        currentBuildingId: state.currentBuildingId,
        // Ne PAS persister inspections (contient des photos volumineuses)
        // Ne PAS persister currentInspection
      }),
    }
  )
);