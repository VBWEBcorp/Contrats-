import { supabase } from '../lib/supabase';
import { Client, ClientHistorique } from '../types/client';

type Subscriber = () => void

class ClientService {
  private subscribers: Subscriber[] = []
  private readonly STORAGE_KEY_CLIENTS = 'clients'
  private readonly STORAGE_KEY_HISTORIQUE = 'clientsHistorique'
  private clients: Client[] = []
  private historique: ClientHistorique[] = []
  private clientsArchives: ClientHistorique[] = []

  constructor() {
    this.loadFromStorage()
    // Vérifier les contrats expirés au démarrage
    this.verifierContratsExpires()
    
    // Vérifier les contrats expirés toutes les heures
    setInterval(() => this.verifierContratsExpires(), 1000 * 60 * 60)
  }

  private loadFromStorage() {
    const clientsJson = localStorage.getItem(this.STORAGE_KEY_CLIENTS)
    const historiqueJson = localStorage.getItem(this.STORAGE_KEY_HISTORIQUE)

    this.clients = clientsJson ? JSON.parse(clientsJson) : []
    this.historique = historiqueJson ? JSON.parse(historiqueJson) : []
  }

  private verifierContratsExpires() {
    const maintenant = new Date()
    let modifie = false

    this.clients.forEach(client => {
      if (client.dateFin && isBefore(parseISO(client.dateFin), maintenant)) {
        this.archiverClient(client)
        modifie = true
      }
    })

    if (modifie) {
      this.notifySubscribers()
    }
  }

  private archiverClient(client: Client) {
    const clientIndex = this.clients.findIndex(c => c.id === client.id)
    if (clientIndex === -1) return

    const clients = this.clients.filter(c => c !== client)
    const historique = this.historique
    
    const clientHistorique: ClientHistorique = {
      ...client,
      dateArchivage: new Date().toISOString(),
      commentaire: 'Archivé automatiquement - Contrat expiré'
    }
    
    historique.push(clientHistorique)
    
    this.clients = clients
    this.historique = historique
    this.saveToStorage()
  }

  private saveToStorage() {
    localStorage.setItem(this.STORAGE_KEY_CLIENTS, JSON.stringify(this.clients))
    localStorage.setItem(this.STORAGE_KEY_HISTORIQUE, JSON.stringify(this.historique))
  }

  getClients(): Client[] {
    return this.clients
  }

  getHistorique(): ClientHistorique[] {
    return this.historique
  }

  getClientsArchives(): ClientHistorique[] {
    return this.clientsArchives
  }

  getClientById(id: string): Client | undefined {
    return this.clients.find(client => client.id === id)
  }

  addClient(client: Omit<Client, 'id'>) {
    const newClient: Client = {
      ...client,
      id: crypto.randomUUID()
    }
    this.clients.push(newClient)
    this.saveToStorage()
    this.notifySubscribers()
    return newClient
  }

  updateClient(updatedClient: Client) {
    const index = this.clients.findIndex(c => c.id === updatedClient.id)
    if (index !== -1) {
      this.clients[index] = updatedClient
      this.saveToStorage()
      this.notifySubscribers()
      return true
    }
    return false
  }

  updateCommentaireArchive(clientId: string, commentaire: string): void {
    const index = this.historique.findIndex((c) => c.id === clientId)
    if (index !== -1) {
      this.historique[index] = {
        ...this.historique[index],
        commentaire
      }
      this.saveToStorage()
      this.notifySubscribers()
    }
  }

  deleteClient(clientId: string) {
    const newClients = this.clients.filter(c => c.id !== clientId)
    if (newClients.length !== this.clients.length) {
      this.clients = newClients
      this.saveToStorage()
      this.notifySubscribers()
      return true
    }
    return false
  }

  subscribe(callback: Subscriber) {
    this.subscribers.push(callback)
    return () => {
      this.unsubscribe(callback)
    }
  }

  unsubscribe(subscriber: Subscriber): void {
    this.subscribers = this.subscribers.filter(s => s !== subscriber)
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback())
  }

  static async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  static async addClient(client: Omit<Client, 'id'>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateClient(id: string, client: Partial<Client>): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .update(client)
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteClient(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async archiveClient(client: Client, commentaire: string): Promise<void> {
    const historiqueClient: Omit<ClientHistorique, 'id'> = {
      client_id: client.id,
      dateArchivage: new Date().toISOString(),
      commentaire
    };

    const { error: archiveError } = await supabase
      .from('historique_clients')
      .insert([historiqueClient]);

    if (archiveError) throw archiveError;

    await this.deleteClient(client.id);
  }

  static async getClientsArchives(): Promise<ClientHistorique[]> {
    const { data, error } = await supabase
      .from('historique_clients')
      .select(`
        *,
        clients (*)
      `);

    if (error) throw error;
    return data || [];
  }
}

export const clientService = new ClientService()
