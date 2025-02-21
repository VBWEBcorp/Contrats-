import { PrestationType, FrequenceType } from './client';

export interface ClientHistorique {
  id: string;
  client_id: string;
  dateArchivage: string;
  commentaire: string;
  nom: string;
  prenom: string;
  entreprise?: string;
  typePrestations: PrestationType[];
  montant: number;
  frequence: FrequenceType;
  dateDebut: string;
  dateFin?: string;
}
