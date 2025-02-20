import { Client, PrestationType } from '../types/client'
import { clientService } from './ClientService'
import { startOfMonth, endOfMonth, isBefore, isAfter, addMonths, format } from 'date-fns'
import { fr } from 'date-fns/locale'

export interface StatsMensuelles {
  date: string
  ca: number
  nombreContrats: number
}

export interface RepartitionPrestation {
  type: PrestationType
  pourcentage: number
  nombre: number
}

class StatistiquesService {
  calculerCAMensuel(clients: Client[]): number {
    return clients.reduce((total, client) => {
      const montantMensuel = client.frequence === 'mensuel' 
        ? client.montant 
        : client.montant / 12
      return total + montantMensuel
    }, 0)
  }

  calculerNombreContratsActifs(clients: Client[]): number {
    return clients.length
  }

  calculerRepartitionPrestations(clients: Client[]): RepartitionPrestation[] {
    const total = clients.reduce((acc, client) => acc + client.typePrestations.length, 0)
    const repartition: Record<PrestationType, number> = {}

    clients.forEach(client => {
      client.typePrestations.forEach(type => {
        repartition[type] = (repartition[type] || 0) + 1
      })
    })

    return Object.entries(repartition).map(([type, nombre]) => ({
      type: type as PrestationType,
      nombre,
      pourcentage: (nombre / total) * 100
    })).sort((a, b) => b.nombre - a.nombre)
  }

  calculerHistoriqueMensuel(nombreMois: number = 12): StatsMensuelles[] {
    const stats: StatsMensuelles[] = []
    const maintenant = new Date()

    for (let i = nombreMois - 1; i >= 0; i--) {
      const dateMois = addMonths(maintenant, -i)
      const debutMois = startOfMonth(dateMois)
      const finMois = endOfMonth(dateMois)

      const clientsDuMois = clientService.getClients().filter(client => {
        const dateDebut = new Date(client.dateDebut)
        const dateFin = client.dateFin ? new Date(client.dateFin) : null

        return (
          (isBefore(dateDebut, finMois) || dateDebut.getTime() === finMois.getTime()) &&
          (!dateFin || isAfter(dateFin, debutMois) || dateFin.getTime() === debutMois.getTime())
        )
      })

      stats.push({
        date: format(dateMois, 'MMMM yyyy', { locale: fr }),
        ca: this.calculerCAMensuel(clientsDuMois),
        nombreContrats: clientsDuMois.length
      })
    }

    return stats
  }

  exporterStatsCSV(): string {
    const stats = this.calculerHistoriqueMensuel()
    const repartition = this.calculerRepartitionPrestations(clientService.getClients())
    
    let csv = 'Statistiques de chiffre d\'affaires\n'
    csv += 'Mois,CA mensuel,Nombre de contrats\n'
    stats.forEach(stat => {
      csv += `${stat.date},${stat.ca.toFixed(2)},${stat.nombre}\n`
    })
    
    csv += '\nRépartition des prestations\n'
    csv += 'Type de prestation,Nombre,Pourcentage\n'
    repartition.forEach(rep => {
      csv += `${rep.type},${rep.nombre},${rep.pourcentage.toFixed(2)}%\n`
    })
    
    return csv
  }
}

export const statistiquesService = new StatistiquesService()
