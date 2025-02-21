import { supabase } from '../lib/supabase';
import { Client, ClientHistorique } from '../types/client';

export class HistoriqueService {
  static async archiveClient(client: Client, commentaire: string): Promise<void> {
    const historiqueClient: ClientHistorique = {
      ...client,
      dateArchivage: new Date().toISOString(),
      commentaire
    };

    const { error } = await supabase
      .from('historique_clients')
      .insert(historiqueClient);

    if (error) {
      throw new Error(`Erreur lors de l'archivage du client: ${error.message}`);
    }
  }

  static async getHistoriqueClients(): Promise<ClientHistorique[]> {
    const { data, error } = await supabase
      .from('historique_clients')
      .select('*')
      .order('dateArchivage', { ascending: false });

    if (error) {
      throw new Error(`Erreur lors de la récupération de l'historique: ${error.message}`);
    }

    return data || [];
  }

  static async getHistoriqueClientById(clientId: string): Promise<ClientHistorique[]> {
    const { data, error } = await supabase
      .from('historique_clients')
      .select('*')
      .eq('id', clientId)
      .order('dateArchivage', { ascending: false });

    if (error) {
      throw new Error(`Erreur lors de la récupération de l'historique du client: ${error.message}`);
    }

    return data || [];
  }
}
