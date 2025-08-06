import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Building {
  id: string;
  nom: string;
  code: string;
  description?: string;
  date_creation: string;
  created_at: string;
  updated_at: string;
}

export interface BuildingWithCount extends Building {
  clientCount: number;
}

export const useBuildings = () => {
  const [buildings, setBuildings] = useState<BuildingWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les bâtiments
      const { data: buildingsData, error: buildingsError } = await supabase
        .from('buildings')
        .select('*')
        .order('nom', { ascending: true });

      if (buildingsError) throw buildingsError;

      // Compter les clients par bâtiment via les équipements
      const buildingsWithCounts = await Promise.all(
        (buildingsData || []).map(async (building) => {
          const { data: equipmentData } = await supabase
            .from('equipment')
            .select('client_id')
            .eq('batiment_id', building.id);

          // Compter les clients uniques
          const uniqueClients = new Set(equipmentData?.map(eq => eq.client_id) || []);
          
          return {
            ...building,
            clientCount: uniqueClients.size
          };
        })
      );

      setBuildings(buildingsWithCounts);
    } catch (error) {
      console.error('Erreur lors du chargement des bâtiments:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des bâtiments.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  return {
    buildings,
    loading,
    refetch: fetchBuildings
  };
};