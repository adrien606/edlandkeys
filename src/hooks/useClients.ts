import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Client {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  date_inscription: string;
  created_at: string;
  updated_at: string;
}

export interface ClientWithBuilding extends Client {
  building?: {
    id: string;
    nom: string;
    code: string;
  };
}

export const useClients = () => {
  const [clients, setClients] = useState<ClientWithBuilding[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      // Récupérer les clients avec leurs équipements pour déterminer le bâtiment
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('nom', { ascending: true });

      if (clientsError) throw clientsError;

      // Récupérer les équipements pour chaque client pour déterminer le bâtiment
      const clientsWithBuildings = await Promise.all(
        (clientsData || []).map(async (client) => {
          const { data: equipmentData } = await supabase
            .from('equipment')
            .select(`
              batiment_id,
              buildings:buildings(id, nom, code)
            `)
            .eq('client_id', client.id)
            .limit(1);

          const building = equipmentData?.[0]?.buildings;
          
          return {
            ...client,
            building: building || undefined
          };
        })
      );

      setClients(clientsWithBuildings);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des clients.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = searchTerm === '' || 
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBuilding = selectedBuilding === '' || 
      client.building?.id === selectedBuilding;

    return matchesSearch && matchesBuilding;
  });

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients: filteredClients,
    allClients: clients,
    loading,
    searchTerm,
    setSearchTerm,
    selectedBuilding,
    setSelectedBuilding,
    refetch: fetchClients
  };
};