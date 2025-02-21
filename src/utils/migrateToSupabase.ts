import { clientService } from '../services/ClientService'
import { supabaseClientService } from '../services/SupabaseClientService'

export async function migrateToSupabase() {
  try {
    console.log('Début de la migration vers Supabase...')
    
    // Récupérer toutes les données du localStorage
    const clients = clientService.getClients()
    const historique = clientService.getHistorique()
    
    console.log(`Migration de ${clients.length} clients et ${historique.length} entrées d'historique...`)
    
    // Migrer les clients actifs
    for (const client of clients) {
      try {
        await supabaseClientService.addClient(client)
        console.log(`Client migré avec succès: ${client.prenom} ${client.nom}`)
      } catch (error) {
        console.error(`Erreur lors de la migration du client ${client.prenom} ${client.nom}:`, error)
      }
    }
    
    // Archiver les clients historiques
    for (const entry of historique) {
      try {
        await supabaseClientService.archiveClient(entry, entry.dateArchivage)
        console.log(`Entrée d'historique migrée avec succès: ${entry.prenom} ${entry.nom}`)
      } catch (error) {
        console.error(`Erreur lors de la migration de l'historique pour ${entry.prenom} ${entry.nom}:`, error)
      }
    }
    
    console.log('Migration terminée avec succès!')
    return true
  } catch (error) {
    console.error('Erreur lors de la migration:', error)
    return false
  }
}
