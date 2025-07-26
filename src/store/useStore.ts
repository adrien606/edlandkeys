import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Client, Equipment, ClientFormData, EquipmentFormData, Building, BuildingFormData } from '@/types';

interface Store {
  clients: Client[];
  buildings: Building[];
  currentBuildingId: string | null;
  searchTerm: string;
  
  // Building Actions
  addBuilding: (buildingData: BuildingFormData) => void;
  updateBuilding: (id: string, buildingData: Partial<Building>) => void;
  deleteBuilding: (id: string) => void;
  setCurrentBuilding: (buildingId: string | null) => void;
  getCurrentBuilding: () => Building | undefined;
  
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
}

const generateId = () => crypto.randomUUID();

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      clients: [],
      buildings: [
        { id: generateId(), nom: 'Bâtiment AI', code: 'BAI', dateCreation: new Date().toISOString() },
        { id: generateId(), nom: 'Bâtiment AS', code: 'BAS', dateCreation: new Date().toISOString() },
        { id: generateId(), nom: 'Bâtiment AB', code: 'BAB', dateCreation: new Date().toISOString() },
        { id: generateId(), nom: 'Bâtiment AT', code: 'BAT', dateCreation: new Date().toISOString() },
      ],
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
    }),
    {
      name: 'coworking-equipment-store',
    }
  )
);