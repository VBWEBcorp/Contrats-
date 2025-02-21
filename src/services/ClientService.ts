import { supabase } from '../lib/supabase';
import { Client, ClientHistorique, PrestationType, FrequenceType } from '../types/client';
import { isBefore, parseISO } from 'date-fns';
import { toast } from 'react-toastify';

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
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('archive', false);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Erreur lors de la récupération des clients');
      return [];
    }
  }

  static async getArchivedClients(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('archive', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching archived clients:', error);
      toast.error('Erreur lors de la récupération des clients archivés');
      return [];
    }
  }

  static async addClient(client: Omit<Client, 'id'>): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select()
        .single();

      if (error) throw error;
      toast.success('Client ajouté avec succès');
      return data;
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Erreur lors de l\'ajout du client');
      return null;
    }
  }

  static async updateClient(client: Client): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(client)
        .eq('id', client.id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Client mis à jour avec succès');
      return data;
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Erreur lors de la mise à jour du client');
      return null;
    }
  }

  static async archiveClient(client: Client, commentaire: string): Promise<boolean> {
    try {
      const dateArchivage = new Date().toISOString();
      
      // Create historique entry
      const historiqueEntry = {
        client_id: client.id,
        dateArchivage,
        commentaire,
        ...client
      };

      const { error: historiqueError } = await supabase
        .from('historique_clients')
        .insert([historiqueEntry]);

      if (historiqueError) throw historiqueError;

      // Update client status
      const { error: updateError } = await supabase
        .from('clients')
        .update({ archive: true })
        .eq('id', client.id);

      if (updateError) throw updateError;

      toast.success('Client archivé avec succès');
      return true;
    } catch (error) {
      console.error('Error archiving client:', error);
      toast.error('Erreur lors de l\'archivage du client');
      return false;
    }
  }

  static async isClientExist(nom: string, prenom: string, dateDebut: string): Promise<boolean> {
    const { data: clients } = await supabase
      .from('clients')
      .select('*')
      .eq('nom', nom)
      .eq('prenom', prenom)
      .eq('archive', false);

    if (!clients || clients.length === 0) return false;

    return clients.some(client => 
      isBefore(parseISO(dateDebut), parseISO(client.dateFin || new Date().toISOString()))
    );
  }
}

export const clientService = new ClientService()
