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
  commentaire?: string;
}

export interface ClientHistorique extends Client {
  dateArchivage: string;
}

export const TYPES_PRESTATIONS: PrestationType[] = [
  'SEO',
  'Dev Web',
  'Maintenance Dev Web',
  'Maintenance Site Web',
  'Site Internet'
];
