export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          nom: string
          prenom: string
          entreprise: string | null
          typePrestations: string[]
          montant: number
          frequence: 'mensuel' | 'annuel'
          dateDebut: string
          dateFin: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }
      clients_historique: {
        Row: {
          id: string
          client_id: string
          nom: string
          prenom: string
          entreprise: string | null
          typePrestations: string[]
          montant: number
          frequence: 'mensuel' | 'annuel'
          dateDebut: string
          dateFin: string | null
          dateArchivage: string
          commentaire: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients_historique']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['clients_historique']['Insert']>
      }
    }
  }
}
