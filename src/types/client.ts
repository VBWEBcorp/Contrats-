export type PrestationType = 
  | 'SEO'
  | 'Dev Web'
  | 'Maintenance Dev Web'
  | 'Maintenance Site Web'
  | 'Site Internet';

export type FrequenceType = 'mensuel' | 'annuel';

export interface Client {
  id: string;
  nom: string;
  prenom: string;
  entreprise?: string;
  typePrestations: PrestationType[];
  montant: number;
  frequence: FrequenceType;
  dateDebut: string;
  dateFin?: string;
  created_at?: string;
  archive: boolean;
}

export interface ClientHistorique {
  id: string;
  client_id: string;
  dateArchivage: string;
  commentaire?: string;
  created_at?: string;
}

export const TYPES_PRESTATIONS: PrestationType[] = [
  'SEO',
  'Dev Web',
  'Maintenance Dev Web',
  'Maintenance Site Web',
  'Site Internet'
];
