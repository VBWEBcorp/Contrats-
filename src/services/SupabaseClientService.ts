import { Client, ClientHistorique } from '../types/client'
import { supabase } from '../lib/supabase'

type Subscriber = () => void

class SupabaseClientService {
  private subscribers: Subscriber[] = []

  // Garder une copie locale des clients pour la performance
  private clients: Client[] = []
  private historique: ClientHistorique[] = []

  constructor() {
    this.loadFromSupabase()
  }

  private async loadFromSupabase() {
    try {
      // Charger les clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (clientsError) throw clientsError
      this.clients = clients || []

      // Charger l'historique
      const { data: historique, error: historiqueError } = await supabase
        .from('clients_historique')
        .select('*')
        .order('created_at', { ascending: false })

      if (historiqueError) throw historiqueError
      this.historique = historique || []

      this.notifySubscribers()
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      // En cas d'erreur, on garde les données locales actuelles
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback())
  }

  subscribe(callback: Subscriber) {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback)
    }
  }

  getClients(): Client[] {
    return this.clients
  }

  getHistorique(): ClientHistorique[] {
    return this.historique
  }

  async addClient(client: Omit<Client, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select()
        .single()

      if (error) throw error

      const newClient = data as Client
      this.clients = [newClient, ...this.clients]
      this.notifySubscribers()
      return newClient
    } catch (error) {
      console.error('Erreur lors de l\'ajout du client:', error)
      throw error
    }
  }

  async updateClient(updatedClient: Client) {
    try {
      const { error } = await supabase
        .from('clients')
        .update(updatedClient)
        .eq('id', updatedClient.id)

      if (error) throw error

      this.clients = this.clients.map(client => 
        client.id === updatedClient.id ? updatedClient : client
      )
      this.notifySubscribers()
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client:', error)
      throw error
    }
  }

  async deleteClient(id: string) {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

      if (error) throw error

      this.clients = this.clients.filter(client => client.id !== id)
      this.notifySubscribers()
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression du client:', error)
      throw error
    }
  }

  async archiveClient(client: Client, dateArchivage: string): Promise<void> {
    try {
      const { id, ...clientSansId } = client;
      const clientHistorique: Omit<ClientHistorique, 'id'> = {
        ...clientSansId,
        dateArchivage
      };

      // Ajouter à l'historique
      const { error: historiqueError } = await supabase
        .from('clients_historique')
        .insert([clientHistorique])

      if (historiqueError) throw historiqueError

      // Supprimer des clients actifs
      await this.deleteClient(client.id)
    } catch (error) {
      console.error('Erreur lors de l\'archivage du client:', error)
      throw error
    }
  }
}

// Instance unique du service
export const supabaseClientService = new SupabaseClientService()
