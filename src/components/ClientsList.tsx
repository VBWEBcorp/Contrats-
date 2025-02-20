import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Client, PrestationType } from '../types/client'
import { ClientModal } from './ClientModal'
import { clientService } from '../services/ClientService'

interface PrestationSummary {
  type: PrestationType
  nombreContrats: number
  montantTotal: number
}

export function ClientsList() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [prestationsSummary, setPrestationsSummary] = useState<PrestationSummary[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined)

  useEffect(() => {
    const updateClients = () => {
      const currentClients = clientService.getClients()
      setClients(currentClients)
      
      // Calculer le résumé des prestations
      const summary: Record<PrestationType, PrestationSummary> = {} as Record<PrestationType, PrestationSummary>
      
      currentClients.forEach(client => {
        const montantMensuel = client.frequence === 'mensuel' ? client.montant : client.montant / 12
        
        client.typePrestations.forEach(type => {
          if (!summary[type]) {
            summary[type] = {
              type,
              nombreContrats: 0,
              montantTotal: 0
            }
          }
          summary[type].nombreContrats++
          // Diviser le montant par le nombre de prestations pour ce client
          summary[type].montantTotal += montantMensuel / client.typePrestations.length
        })
      })
      
      setPrestationsSummary(Object.values(summary).sort((a, b) => b.montantTotal - a.montantTotal))
    }

    updateClients()
    const unsubscribe = clientService.subscribe(updateClients)
    return () => unsubscribe()
  }, [])

  const handleAddClient = (clientData: Omit<Client, 'id'>) => {
    clientService.addClient(clientData)
    setIsModalOpen(false)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Clients actuels</h1>
          <p className="mt-2 text-sm text-gray-700">
            Liste de tous vos clients actifs
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un client
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Nom
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Entreprise
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Prestations
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Montant
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Fréquence
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Date de début
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Date de fin
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {client.prenom} {client.nom}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {client.entreprise || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {client.typePrestations.join(', ')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {client.montant.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {client.frequence}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(client.dateDebut).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {client.dateFin
                          ? new Date(client.dateFin).toLocaleDateString('fr-FR')
                          : '-'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => {
                            setSelectedClient(client)
                            setIsModalOpen(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
                              clientService.deleteClient(client.id)
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Résumé des prestations mensuelles */}
      <div className="mt-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-base font-semibold leading-6 text-gray-900">
              Total des prestations mensuelles
            </h2>
          </div>
        </div>
        <div className="mt-2 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <div className="bg-white px-4 py-5 sm:p-6">
                  <p className="text-3xl font-semibold text-gray-900">
                    {prestationsSummary
                      .reduce((total, prestation) => total + prestation.montantTotal, 0)
                      .toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    /mois
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedClient(undefined)
        }}
        clientToEdit={selectedClient}
      />
    </div>
  )
}
