import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface StockStore {
  stockItems: StockItem[];
  setStockItems: (items: StockItem[]) => void;
  addStockItem: (item: Omit<StockItem, 'id'>) => void;
  updateStockItem: (id: string, updates: Partial<StockItem>) => void;
  deleteStockItem: (id: string) => void;
  decrementQuantity: (id: string) => boolean; // Retourne true si succès
  incrementQuantity: (id: string) => void;
  getAvailableItems: (batimentId?: string) => StockItem[];
}

export const useStockStore = create<StockStore>()(
  persist(
    (set, get) => ({
      stockItems: [],
      
      setStockItems: (items) => set({ stockItems: items }),
      
      addStockItem: (item) => {
        const newItem: StockItem = {
          ...item,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          stockItems: [...state.stockItems, newItem],
        }));
      },
      
      updateStockItem: (id, updates) => {
        set((state) => ({
          stockItems: state.stockItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },
      
      deleteStockItem: (id) => {
        set((state) => ({
          stockItems: state.stockItems.filter((item) => item.id !== id),
        }));
      },
      
      decrementQuantity: (id) => {
        const { stockItems } = get();
        const item = stockItems.find((item) => item.id === id);
        
        if (!item || item.quantiteDisponible <= 0) {
          return false;
        }
        
        set((state) => ({
          stockItems: state.stockItems.map((item) =>
            item.id === id
              ? { ...item, quantiteDisponible: item.quantiteDisponible - 1 }
              : item
          ),
        }));
        
        return true;
      },
      
      incrementQuantity: (id) => {
        set((state) => ({
          stockItems: state.stockItems.map((item) =>
            item.id === id
              ? { 
                  ...item, 
                  quantiteDisponible: Math.min(item.quantiteDisponible + 1, item.quantite)
                }
              : item
          ),
        }));
      },
      
      getAvailableItems: (batimentId) => {
        const { stockItems } = get();
        return stockItems.filter((item) => {
          const hasQuantity = item.quantiteDisponible > 0;
          const matchesBuilding = !batimentId || item.batimentId === batimentId;
          return hasQuantity && matchesBuilding;
        });
      },
    }),
    {
      name: 'stock-management-store',
    }
  )
);