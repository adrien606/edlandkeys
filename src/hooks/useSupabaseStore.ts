import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Client, Building, Equipment, ClientFormData, EquipmentFormData, BuildingFormData } from '@/types';
import { StockItem } from './useStockManagement';

interface SupabaseStore {
  // State
  clients: Client[];
  buildings: Building[];
  stockItems: StockItem[];
  currentBuildingId: string;
  searchTerm: string;
  loading: boolean;
  
  // Actions
  loadData: () => Promise<void>;
  
  // Buildings
  addBuilding: (data: BuildingFormData) => Promise<void>;
  updateBuilding: (id: string, data: Partial<BuildingFormData>) => Promise<void>;
  deleteBuilding: (id: string) => Promise<void>;
  setCurrentBuildingId: (id: string) => void;
  
  // Clients
  addClient: (data: ClientFormData) => Promise<void>;
  updateClient: (id: string, data: Partial<ClientFormData>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  
  // Equipment
  addEquipment: (data: EquipmentFormData) => Promise<void>;
  updateEquipmentStatus: (clientId: string, equipmentId: string, status: Equipment['statut'], dateRestitution?: string) => Promise<void>;
  deleteEquipment: (clientId: string, equipmentId: string) => Promise<void>;
  validateEquipment: (clientId: string, equipmentId: string, validation: Equipment['validationClient']) => Promise<void>;
  
  // Stock
  addStockItem: (item: Omit<StockItem, 'id'>) => Promise<void>;
  updateStockItem: (id: string, updates: Partial<StockItem>) => Promise<void>;
  deleteStockItem: (id: string) => Promise<void>;
  decrementQuantity: (id: string) => Promise<boolean>;
  incrementQuantity: (id: string) => Promise<void>;
  
  // Utility
  setSearchTerm: (term: string) => void;
  getFilteredClients: () => Client[];
  getAvailableItems: (batimentId?: string) => StockItem[];
  getEquipmentStats: () => { total: number; remis: number; restitue: number; perdu: number };
}

export const useSupabaseStore = create<SupabaseStore>((set, get) => ({
  // State
  clients: [],
  buildings: [],
  stockItems: [],
  currentBuildingId: '',
  searchTerm: '',
  loading: false,

  // Load all data from Supabase
  loadData: async () => {
    set({ loading: true });
    
    try {
      // Load buildings
      const { data: buildingsData } = await supabase
        .from('buildings')
        .select('*')
        .order('nom');
      
      // Load clients with equipment
      const { data: clientsData } = await supabase
        .from('clients')
        .select(`
          *,
          equipment (*)
        `)
        .order('nom');
      
      // Load stock items
      const { data: stockData } = await supabase
        .from('stock_items')
        .select('*')
        .order('type, numero');
      
      // Transform data to match existing interfaces
      const buildings: Building[] = (buildingsData || []).map(b => ({
        id: b.id,
        nom: b.nom,
        code: b.code,
        description: b.description,
        dateCreation: b.date_creation
      }));
      
      const clients: Client[] = (clientsData || []).map(c => ({
        id: c.id,
        nom: c.nom,
        prenom: c.prenom,
        email: c.email,
        telephone: c.telephone,
        dateInscription: c.date_inscription,
        equipements: (c.equipment || []).map((e: any) => ({
          id: e.id,
          type: e.type as 'cle' | 'badge' | 'telecommande',
          numero: e.numero,
          description: e.description,
          statut: e.statut as 'remis' | 'restitue' | 'perdu' | 'non_rendu',
          batimentId: e.batiment_id,
          dateRemise: e.date_remise,
          dateRestitution: e.date_restitution,
          validationClient: e.validation_client as Equipment['validationClient']
        }))
      }));
      
      const stockItems: StockItem[] = (stockData || []).map(s => ({
        id: s.id,
        type: s.type as 'cle' | 'badge' | 'telecommande',
        numero: s.numero,
        description: s.description,
        statut: s.statut as 'disponible' | 'attribue' | 'perdu',
        clientActuel: s.client_actuel,
        batimentId: s.batiment_id,
        quantite: s.quantite,
        quantiteDisponible: s.quantite_disponible
      }));
      
      set({ 
        buildings, 
        clients, 
        stockItems,
        currentBuildingId: buildings.length > 0 ? buildings[0].id : '',
        loading: false 
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      set({ loading: false });
    }
  },

  // Buildings
  addBuilding: async (data) => {
    const { data: newBuilding, error } = await supabase
      .from('buildings')
      .insert({
        nom: data.nom,
        code: data.code,
        description: data.description
      })
      .select()
      .single();
    
    if (error) throw error;
    
    const building: Building = {
      id: newBuilding.id,
      nom: newBuilding.nom,
      code: newBuilding.code,
      description: newBuilding.description,
      dateCreation: newBuilding.date_creation
    };
    
    set(state => ({ buildings: [...state.buildings, building] }));
  },

  updateBuilding: async (id, data) => {
    const { error } = await supabase
      .from('buildings')
      .update({
        nom: data.nom,
        code: data.code,
        description: data.description
      })
      .eq('id', id);
    
    if (error) throw error;
    
    set(state => ({
      buildings: state.buildings.map(b =>
        b.id === id ? { ...b, ...data } : b
      )
    }));
  },

  deleteBuilding: async (id) => {
    const { error } = await supabase
      .from('buildings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    set(state => ({
      buildings: state.buildings.filter(b => b.id !== id),
      currentBuildingId: state.currentBuildingId === id ? '' : state.currentBuildingId
    }));
  },

  setCurrentBuildingId: (id) => set({ currentBuildingId: id }),

  // Clients
  addClient: async (data) => {
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone
      })
      .select()
      .single();
    
    if (error) throw error;
    
    const client: Client = {
      id: newClient.id,
      nom: newClient.nom,
      prenom: newClient.prenom,
      email: newClient.email,
      telephone: newClient.telephone,
      dateInscription: newClient.date_inscription,
      equipements: []
    };
    
    set(state => ({ clients: [...state.clients, client] }));
  },

  updateClient: async (id, data) => {
    const { error } = await supabase
      .from('clients')
      .update({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone
      })
      .eq('id', id);
    
    if (error) throw error;
    
    set(state => ({
      clients: state.clients.map(c =>
        c.id === id ? { ...c, ...data } : c
      )
    }));
  },

  deleteClient: async (id) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    set(state => ({
      clients: state.clients.filter(c => c.id !== id)
    }));
  },

  getClientById: (id) => {
    return get().clients.find(c => c.id === id);
  },

  // Equipment
  addEquipment: async (data) => {
    const { data: newEquipment, error } = await supabase
      .from('equipment')
      .insert({
        client_id: data.clientId,
        type: data.equipmentType,
        numero: data.numero,
        description: data.description,
        statut: 'remis',
        batiment_id: data.batimentId,
        date_remise: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    const equipment: Equipment = {
      id: newEquipment.id,
      type: newEquipment.type as 'cle' | 'badge' | 'telecommande',
      numero: newEquipment.numero,
      description: newEquipment.description,
      statut: newEquipment.statut as 'remis' | 'restitue' | 'perdu' | 'non_rendu',
      batimentId: newEquipment.batiment_id,
      dateRemise: newEquipment.date_remise,
      dateRestitution: newEquipment.date_restitution,
      validationClient: newEquipment.validation_client as Equipment['validationClient']
    };
    
    set(state => ({
      clients: state.clients.map(c =>
        c.id === data.clientId
          ? { ...c, equipements: [...c.equipements, equipment] }
          : c
      )
    }));
  },

  updateEquipmentStatus: async (clientId, equipmentId, status, dateRestitution) => {
    const updateData: any = { statut: status };
    if (dateRestitution) {
      updateData.date_restitution = dateRestitution;
    }
    
    const { error } = await supabase
      .from('equipment')
      .update(updateData)
      .eq('id', equipmentId);
    
    if (error) throw error;
    
    set(state => ({
      clients: state.clients.map(c =>
        c.id === clientId
          ? {
              ...c,
              equipements: c.equipements.map(e =>
                e.id === equipmentId
                  ? { ...e, statut: status, dateRestitution }
                  : e
              )
            }
          : c
      )
    }));
  },

  deleteEquipment: async (clientId, equipmentId) => {
    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', equipmentId);
    
    if (error) throw error;
    
    set(state => ({
      clients: state.clients.map(c =>
        c.id === clientId
          ? { ...c, equipements: c.equipements.filter(e => e.id !== equipmentId) }
          : c
      )
    }));
  },

  validateEquipment: async (clientId, equipmentId, validation) => {
    const { error } = await supabase
      .from('equipment')
      .update({ validation_client: validation })
      .eq('id', equipmentId);
    
    if (error) throw error;
    
    set(state => ({
      clients: state.clients.map(c =>
        c.id === clientId
          ? {
              ...c,
              equipements: c.equipements.map(e =>
                e.id === equipmentId
                  ? { ...e, validationClient: validation }
                  : e
              )
            }
          : c
      )
    }));
  },

  // Stock
  addStockItem: async (item) => {
    const { data: newItem, error } = await supabase
      .from('stock_items')
      .insert({
        type: item.type,
        numero: item.numero,
        description: item.description,
        statut: item.statut,
        client_actuel: item.clientActuel,
        batiment_id: item.batimentId,
        quantite: item.quantite,
        quantite_disponible: item.quantiteDisponible
      })
      .select()
      .single();
    
    if (error) throw error;
    
    const stockItem: StockItem = {
      id: newItem.id,
      type: newItem.type as 'cle' | 'badge' | 'telecommande',
      numero: newItem.numero,
      description: newItem.description,
      statut: newItem.statut as 'disponible' | 'attribue' | 'perdu',
      clientActuel: newItem.client_actuel,
      batimentId: newItem.batiment_id,
      quantite: newItem.quantite,
      quantiteDisponible: newItem.quantite_disponible
    };
    
    set(state => ({ stockItems: [...state.stockItems, stockItem] }));
  },

  updateStockItem: async (id, updates) => {
    const updateData: any = {};
    if (updates.type) updateData.type = updates.type;
    if (updates.numero !== undefined) updateData.numero = updates.numero;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.statut) updateData.statut = updates.statut;
    if (updates.clientActuel !== undefined) updateData.client_actuel = updates.clientActuel;
    if (updates.batimentId) updateData.batiment_id = updates.batimentId;
    if (updates.quantite !== undefined) updateData.quantite = updates.quantite;
    if (updates.quantiteDisponible !== undefined) updateData.quantite_disponible = updates.quantiteDisponible;
    
    const { error } = await supabase
      .from('stock_items')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
    
    set(state => ({
      stockItems: state.stockItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  },

  deleteStockItem: async (id) => {
    const { error } = await supabase
      .from('stock_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    set(state => ({
      stockItems: state.stockItems.filter(item => item.id !== id)
    }));
  },

  decrementQuantity: async (id) => {
    const { stockItems } = get();
    const item = stockItems.find(item => item.id === id);
    
    if (!item || item.quantiteDisponible <= 0) {
      return false;
    }
    
    const newQuantity = item.quantiteDisponible - 1;
    
    const { error } = await supabase
      .from('stock_items')
      .update({ quantite_disponible: newQuantity })
      .eq('id', id);
    
    if (error) throw error;
    
    set(state => ({
      stockItems: state.stockItems.map(item =>
        item.id === id
          ? { ...item, quantiteDisponible: newQuantity }
          : item
      )
    }));
    
    return true;
  },

  incrementQuantity: async (id) => {
    const { stockItems } = get();
    const item = stockItems.find(item => item.id === id);
    
    if (!item) return;
    
    const newQuantity = Math.min(item.quantiteDisponible + 1, item.quantite);
    
    const { error } = await supabase
      .from('stock_items')
      .update({ quantite_disponible: newQuantity })
      .eq('id', id);
    
    if (error) throw error;
    
    set(state => ({
      stockItems: state.stockItems.map(item =>
        item.id === id
          ? { ...item, quantiteDisponible: newQuantity }
          : item
      )
    }));
  },

  // Utility
  setSearchTerm: (term) => set({ searchTerm: term }),

  getFilteredClients: () => {
    const { clients, searchTerm, currentBuildingId } = get();
    
    return clients.filter(client => {
      const matchesSearch = !searchTerm || 
        client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBuilding = !currentBuildingId || 
        client.equipements.some(eq => eq.batimentId === currentBuildingId);
      
      return matchesSearch && matchesBuilding;
    });
  },

  getAvailableItems: (batimentId) => {
    const { stockItems } = get();
    return stockItems.filter(item => {
      const hasQuantity = item.quantiteDisponible > 0;
      const matchesBuilding = !batimentId || item.batimentId === batimentId;
      return hasQuantity && matchesBuilding;
    });
  },

  getEquipmentStats: () => {
    const { clients } = get();
    const allEquipment = clients.flatMap(c => c.equipements);
    
    return {
      total: allEquipment.length,
      remis: allEquipment.filter(e => e.statut === 'remis').length,
      restitue: allEquipment.filter(e => e.statut === 'restitue').length,
      perdu: allEquipment.filter(e => e.statut === 'perdu').length
    };
  }
}));