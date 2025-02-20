import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { History } from 'lucide-react'
import { ClientHistorique } from '../types/client'
import { clientService } from '../services/ClientService'
import { CommentaireModal } from './CommentaireModal'
import { MessageCircle } from 'lucide-react'

export function HistoriqueList() {
  const [historique, setHistorique] = useState<ClientHistorique[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [commentaireTemp, setCommentaireTemp] = useState('')
  const [isCommentaireModalOpen, setIsCommentaireModalOpen] = useState(false)

  useEffect(() => {
    // Charger l'historique initial
    setHistorique(clientService.getHistorique())

    // S'abonner aux changements
    const unsubscribe = clientService.subscribe(() => {
      setHistorique(clientService.getHistorique())
    })

    // Vérifier les contrats expirés toutes les heures
    const interval = setInterval(() => {
      clientService.verifierContratsExpires()
    }, 1000 * 60 * 60)

    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }, [])

  const handleOpenCommentaire = (client: ClientHistorique) => {
    setSelectedClientId(client.id)
    setCommentaireTemp(client.commentaire || '')
    setIsCommentaireModalOpen(true)
  }

  const handleSaveCommentaire = () => {
    if (selectedClientId) {
      clientService.updateCommentaireArchive(selectedClientId, commentaireTemp)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <div className="flex items-center">
            <History className="h-6 w-6 text-blue-500 mr-2" />
            <h1 className="text-xl font-semibold text-gray-900">Historique des clients</h1>
          </div>
          <p className="mt-2 text-sm text-gray-700">
            Archive des contrats terminés
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Client
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Prestations
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Montant
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Période
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Commentaire
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {historique.map((client) => (
                    <tr key={client.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="font-medium text-gray-900">
                          {client.nom} {client.prenom}
                        </div>
                        {client.entreprise && (
                          <div className="text-gray-500">{client.entreprise}</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="space-x-1">
                          {client.typePrestations.map((type) => (
                            <span
                              key={type}
                              className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div>
                          {client.montant.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          })}
                        </div>
                        <div className="text-xs text-gray-400">{client.frequence}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div>
                          Du {format(new Date(client.dateDebut), 'dd/MM/yyyy', { locale: fr })}
                        </div>
                        <div>
                          Au {format(new Date(client.dateFin!), 'dd/MM/yyyy', { locale: fr })}
                        </div>
                        <div className="text-xs text-gray-400">
                          Archivé le{' '}
                          {format(new Date(client.dateArchivage), 'dd/MM/yyyy', {
                            locale: fr,
                          })}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenCommentaire(client)}
                            className="inline-flex items-center text-blue-600 hover:text-blue-900"
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {client.commentaire ? 'Modifier' : 'Ajouter'}
                          </button>
                          {client.commentaire && (
                            <span className="text-gray-500">{client.commentaire}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {historique.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-sm text-gray-500 text-center">
                        Aucun contrat dans l'historique
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <CommentaireModal
        isOpen={isCommentaireModalOpen}
        onClose={() => setIsCommentaireModalOpen(false)}
        commentaire={commentaireTemp}
        onChange={setCommentaireTemp}
        onSave={handleSaveCommentaire}
      />
    </div>
  )
}
