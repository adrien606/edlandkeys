import { create } from 'zustand';
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

let inspectionSaveTimer: ReturnType<typeof setTimeout> | undefined;

const toInspectionRow = (inspection: Inspection) => ({
  id: inspection.id,
  client_id: inspection.client_id,
  client_name: inspection.client_name,
  client_email: inspection.client_email,
  building_id: inspection.building_id,
  building_code: inspection.building_code,
  type: inspection.type,
  entry_inspection_id: inspection.entry_inspection_id,
  date: inspection.date,
  items: inspection.items,
  signature: inspection.signature,
  site_manager_name: inspection.site_manager_name,
  site_manager_signature: inspection.site_manager_signature,
  completed: inspection.completed
});

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
  isLoading: boolean;
  isInitialized: boolean;
  
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
  createInspection: (clientId: string, clientName: string, clientEmail: string, type: 'entry' | 'exit', buildingId?: string, entryInspectionId?: string) => Promise<void>;
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

export const useSupabaseStore = create<SupabaseStore>()((set, get) => ({
  clients: [],
  buildings: [],
  stockItems: [],
  inspections: [],
  currentInspection: null,
  currentBuildingId: null,
  searchTerm: '',
  isOnline: navigator.onLine,
  syncPending: false,
  isLoading: true,
  isInitialized: false,

      setOnlineStatus: (status) => {
        set({ isOnline: status });
        if (status) {
          // Auto-sync when coming back online
          get().syncFromSupabase();
        }
      },

      initialize: async () => {
        if (get().isInitialized) return;
        
        set({ isLoading: true });
        
        const store = get();
        
        // Listen for online/offline events
        window.addEventListener('online', () => store.setOnlineStatus(true));
        window.addEventListener('offline', () => store.setOnlineStatus(false));
        
        // Initial sync if online
        if (store.isOnline) {
          await store.syncFromSupabase();

          let draftId: string | null = null;
          try {
            draftId = sessionStorage.getItem('currentInspectionId');
          } catch (error) {
            console.warn('Inspection draft identifier could not be read:', error);
          }

          if (draftId) {
            const { data: draft, error } = await supabase
              .from('inspections')
              .select('*')
              .eq('id', draftId)
              .eq('completed', false)
              .maybeSingle();

            if (error) {
              console.error('Failed to restore inspection draft:', error);
            } else if (draft) {
              set({
                currentInspection: {
                  id: draft.id,
                  client_id: draft.client_id,
                  client_name: draft.client_name,
                  client_email: draft.client_email,
                  building_id: draft.building_id || undefined,
                  building_code: draft.building_code || undefined,
                  type: draft.type as 'entry' | 'exit',
                  entry_inspection_id: draft.entry_inspection_id || undefined,
                  date: draft.date || draft.created_at || new Date().toISOString(),
                  items: draft.items as unknown as Inspection['items'],
                  signature: draft.signature || '',
                  site_manager_name: draft.site_manager_name || undefined,
                  site_manager_signature: draft.site_manager_signature || undefined,
                  completed: false,
                  pdf_generated: draft.pdf_generated || false,
                  email_sent: draft.email_sent || false,
                  created_at: draft.created_at || undefined,
                  updated_at: draft.updated_at || undefined
                }
              });
            } else {
              try {
                sessionStorage.removeItem('currentInspectionId');
              } catch (error) {
                console.warn('Inspection draft identifier could not be cleared:', error);
              }
            }
          }
        }
        
        set({ isInitialized: true, isLoading: false });
      },

      syncFromSupabase: async () => {
        if (!get().isOnline) {
          set({ isLoading: false });
          return;
        }
        
        set({ isLoading: true, syncPending: true });
        
        try {
          // Fetch clients first (most important for the client list)
          const clientsResult = await supabase
            .from('clients')
            .select('*')
            .order('nom', { ascending: true });

          if (clientsResult.error) {
            console.error('Error fetching clients:', clientsResult.error);
            throw clientsResult.error;
          }

          const clients = clientsResult.data || [];

          // Fetch equipment separately
          const equipmentResult = await supabase
            .from('equipment')
            .select('*');

          const equipment = equipmentResult.error ? [] : (equipmentResult.data || []);

          // Create equipment lookup map for faster client-equipment matching
          const equipmentByClient = new Map<string, typeof equipment>();
          equipment.forEach(eq => {
            if (eq.client_id) {
              const existing = equipmentByClient.get(eq.client_id) || [];
              existing.push(eq);
              equipmentByClient.set(eq.client_id, existing);
            }
          });

          // Transform clients with their equipment
          const transformedClients: Client[] = clients.map(client => ({
            id: client.id,
            nom: client.nom,
            prenom: client.prenom,
            email: client.email,
            telephone: client.telephone,
            dateInscription: client.date_inscription || client.created_at,
            equipements: (equipmentByClient.get(client.id) || []).map(eq => ({
              id: eq.id,
              type: eq.type as 'cle' | 'badge' | 'telecommande',
              numero: eq.numero,
              description: eq.description,
              statut: eq.statut as Equipment['statut'],
              batimentId: eq.batiment_id,
              dateRemise: eq.date_remise,
              dateRestitution: eq.date_restitution,
              validationClient: eq.validation_client
            }))
          }));

          // Update state with clients immediately
          set({ clients: transformedClients });

          // Fetch other data in background
          const [buildingsResult, stockResult] = await Promise.all([
            supabase.from('buildings').select('*').order('nom', { ascending: true }),
            supabase.from('stock_items').select('*')
          ]);

          const buildings = buildingsResult.error ? [] : (buildingsResult.data || []);
          const stockItems = stockResult.error ? [] : (stockResult.data || []);

          const transformedBuildings: Building[] = buildings.map(building => ({
            id: building.id,
            nom: building.nom,
            code: building.code,
            description: building.description,
            dateCreation: building.date_creation || building.created_at
          }));

          const transformedStockItems: StockItem[] = stockItems.map(item => ({
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
          }));

          const createEmptyInspectionItem = (name: string): InspectionItem => ({
            id: generateId(),
            name,
            comment: '',
            photos: [],
            status: 'good'
          });

          const createEmptyInspectionItems = () => ({
            prises: createEmptyInspectionItem('Prises électriques'),
            murs: createEmptyInspectionItem('Murs'),
            sol: createEmptyInspectionItem('Sol'),
            plafond: createEmptyInspectionItem('Plafond'),
            fenetres: createEmptyInspectionItem('Fenêtres'),
            portes: createEmptyInspectionItem('Portes')
          });

          // Fetch inspection summaries only (items/signatures are very heavy payloads)
          const inspectionsResult = await supabase
            .from('inspections')
            .select('id, client_id, client_name, client_email, building_id, building_code, type, entry_inspection_id, date, completed, pdf_generated, email_sent, created_at, updated_at')
            .order('created_at', { ascending: false })
            .limit(200);

          if (inspectionsResult.error) {
            console.error('Error fetching inspections summaries:', inspectionsResult.error);
          }

          const inspections = inspectionsResult.data || [];

          const transformedInspections: Inspection[] = inspections.map(inspection => ({
            id: inspection.id,
            client_id: inspection.client_id,
            client_name: inspection.client_name,
            client_email: inspection.client_email,
            building_id: inspection.building_id,
            building_code: inspection.building_code,
            type: inspection.type as 'entry' | 'exit',
            entry_inspection_id: inspection.entry_inspection_id,
            date: inspection.date,
            items: createEmptyInspectionItems(),
            signature: '',
            site_manager_name: undefined,
            site_manager_signature: undefined,
            completed: inspection.completed || false,
            pdf_generated: inspection.pdf_generated || false,
            email_sent: inspection.email_sent || false,
            created_at: inspection.created_at,
            updated_at: inspection.updated_at
          }));

          set({
            buildings: transformedBuildings,
            stockItems: transformedStockItems,
            inspections: transformedInspections,
            syncPending: false,
            isLoading: false
          });

        } catch (error) {
          console.error('Sync from Supabase failed:', error);
          // Even on error, set loading to false so the UI isn't stuck
          set({ syncPending: false, isLoading: false });
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
        const filteredClients = currentBuildingId 
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
      createInspection: async (clientId, clientName, clientEmail, type, buildingId, entryInspectionId) => {
        if (!get().isOnline) {
          throw new Error("Une connexion internet est requise pour commencer un état des lieux.");
        }

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
        
        const { error } = await supabase
          .from('inspections')
          .insert(toInspectionRow(newInspection));

        if (error) {
          console.error('Failed to create inspection draft:', error);
          throw new Error(error.message || "Le brouillon n'a pas pu être créé.");
        }

        try {
          sessionStorage.setItem('currentInspectionId', newInspection.id);
        } catch (error) {
          console.warn('Inspection draft identifier could not be saved:', error);
        }

        set(state => ({
          currentInspection: newInspection,
          inspections: [newInspection, ...state.inspections.filter(i => i.id !== newInspection.id)]
        }));
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
        if (inspectionSaveTimer) clearTimeout(inspectionSaveTimer);
        inspectionSaveTimer = setTimeout(async () => {
          const draft = get().currentInspection;
          if (!draft || !get().isOnline) return;
          const { error } = await supabase.from('inspections').update(toInspectionRow(draft)).eq('id', draft.id);
          if (error) console.error('Failed to autosave inspection draft:', error);
        }, 500);
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
        if (inspectionSaveTimer) clearTimeout(inspectionSaveTimer);
        inspectionSaveTimer = setTimeout(async () => {
          const draft = get().currentInspection;
          if (!draft || !get().isOnline) return;
          const { error } = await supabase.from('inspections').update(toInspectionRow(draft)).eq('id', draft.id);
          if (error) console.error('Failed to autosave inspection draft:', error);
        }, 500);
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
        if (inspectionSaveTimer) clearTimeout(inspectionSaveTimer);
        inspectionSaveTimer = setTimeout(async () => {
          const draft = get().currentInspection;
          if (!draft || !get().isOnline) return;
          const { error } = await supabase.from('inspections').update(toInspectionRow(draft)).eq('id', draft.id);
          if (error) console.error('Failed to autosave inspection draft:', error);
        }, 500);
      },

      setSignature: (signature) => {
        set(state => ({
          currentInspection: state.currentInspection ? {
            ...state.currentInspection,
            signature
          } : null
        }));
        if (inspectionSaveTimer) clearTimeout(inspectionSaveTimer);
        inspectionSaveTimer = setTimeout(async () => {
          const draft = get().currentInspection;
          if (!draft || !get().isOnline) return;
          const { error } = await supabase.from('inspections').update(toInspectionRow(draft)).eq('id', draft.id);
          if (error) console.error('Failed to autosave inspection draft:', error);
        }, 500);
      },

      setSiteManagerInfo: (name, signature) => {
        set(state => ({
          currentInspection: state.currentInspection ? {
            ...state.currentInspection,
            site_manager_name: name,
            site_manager_signature: signature
          } : null
        }));
        if (inspectionSaveTimer) clearTimeout(inspectionSaveTimer);
        inspectionSaveTimer = setTimeout(async () => {
          const draft = get().currentInspection;
          if (!draft || !get().isOnline) return;
          const { error } = await supabase.from('inspections').update(toInspectionRow(draft)).eq('id', draft.id);
          if (error) console.error('Failed to autosave inspection draft:', error);
        }, 500);
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

        if (!get().isOnline) {
          throw new Error("Connexion internet absente. L'état des lieux reste en cours et pourra être finalisé après reconnexion.");
        }

        if (inspectionSaveTimer) {
          clearTimeout(inspectionSaveTimer);
          inspectionSaveTimer = undefined;
        }

        const completedInspection = {
          ...currentInspection,
          completed: true
        };

        const { data, error } = await supabase
          .from('inspections')
          .update(toInspectionRow(completedInspection))
          .eq('id', completedInspection.id)
          .select('id')
          .single();

        if (error || !data) {
          console.error('Failed to save inspection to Supabase:', error);
          throw new Error(error?.message || "Échec de l'enregistrement de l'état des lieux");
        }

        try {
          sessionStorage.removeItem('currentInspectionId');
        } catch (storageError) {
          console.warn('Inspection draft identifier could not be cleared:', storageError);
        }

        set(state => ({
          inspections: [completedInspection, ...state.inspections.filter(i => i.id !== completedInspection.id)],
          currentInspection: null
        }));
  }
}));