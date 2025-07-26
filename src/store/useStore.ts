import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Client, Equipment, ClientFormData, EquipmentFormData } from '@/types';

interface Store {
  clients: Client[];
  searchTerm: string;
  
  // Actions
  addClient: (clientData: ClientFormData) => void;
  updateClient: (id: string, clientData: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  addEquipment: (data: EquipmentFormData) => void;
  updateEquipmentStatus: (clientId: string, equipmentId: string, status: Equipment['statut'], dateRestitution?: string) => void;
  validateEquipment: (clientId: string, equipmentId: string, nomClient: string) => void;
  
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
      searchTerm: '',
      
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
      
      validateEquipment: (clientId, equipmentId, nomClient) => {
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
        const { clients, searchTerm } = get();
        if (!searchTerm) return clients;
        
        const term = searchTerm.toLowerCase();
        return clients.filter((client) =>
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
        const clients = get().clients;
        const allEquipments = clients.flatMap((client) => client.equipements);
        
        return {
          total: allEquipments.length,
          remis: allEquipments.filter((eq) => eq.statut === 'remis').length,
          restitue: allEquipments.filter((eq) => eq.statut === 'restitue').length,
          perdu: allEquipments.filter((eq) => eq.statut === 'perdu').length,
          nonRendu: allEquipments.filter((eq) => eq.statut === 'non_rendu').length,
        };
      },
    }),
    {
      name: 'coworking-equipment-store',
    }
  )
);