import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { History, MessageCircle, Building2, Calendar, Archive, Euro } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClientHistorique } from '../types/client'
import { clientService } from '../services/ClientService'
import { CommentaireModal } from './CommentaireModal'
import { RootLayout, PageHeader, PageHeaderHeading, PageHeaderDescription } from './layout/RootLayout'
import { Card, CardBody } from "@nextui-org/react"

const PrestationBadge = ({ type }: { type: string }) => {
  const colors: Record<string, string> = {
    'Développement web': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Design UI/UX': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'SEO': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Marketing digital': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Maintenance': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-all duration-200 hover:scale-105 ${colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}>
      {type}
    </span>
  )
}

export function HistoriqueList() {
  const [historique, setHistorique] = useState<ClientHistorique[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [commentaireTemp, setCommentaireTemp] = useState('')
  const [isCommentaireModalOpen, setIsCommentaireModalOpen] = useState(false)

  useEffect(() => {
    // Charger l'historique au montage
    setHistorique(clientService.getHistorique())

    // S'abonner aux mises à jour
    const unsubscribe = clientService.subscribe(() => {
      setHistorique(clientService.getHistorique())
    })

    return () => unsubscribe()
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
    <RootLayout>
      <PageHeader>
        <div>
          <PageHeaderHeading>Historique des clients</PageHeaderHeading>
          <PageHeaderDescription>
            Archive des contrats terminés et historique des collaborations
          </PageHeaderDescription>
        </div>
      </PageHeader>

      <div className="container py-6">
        <Card className="shadow-glass backdrop-glass">
          <CardBody>
            <div className="space-y-2">
              <AnimatePresence>
                {historique.map((client, index) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-6">
                      {/* Informations client */}
                      <div className="min-w-[200px]">
                        <h3 className="font-medium">
                          {client.prenom} {client.nom}
                        </h3>
                        {client.entreprise && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Building2 className="h-3.5 w-3.5" />
                            {client.entreprise}
                          </p>
                        )}
                      </div>

                      {/* Prestations */}
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-1">
                          {client.typePrestations.map((type) => (
                            <PrestationBadge key={type} type={type} />
                          ))}
                        </div>
                      </div>

                      {/* Montant */}
                      <div className="flex items-center gap-1 min-w-[120px]">
                        <Euro className="h-3.5 w-3.5 text-primary" />
                        <span className="font-medium">
                          {client.montant.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          })}
                        </span>
                        <span className="text-xs text-muted-foreground">/{client.frequence}</span>
                      </div>

                      {/* Dates */}
                      <div className="flex items-center gap-4 min-w-[280px]">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <div>
                            {format(new Date(client.dateDebut), 'dd/MM/yyyy', { locale: fr })}
                            {' → '}
                            {format(new Date(client.dateFin!), 'dd/MM/yyyy', { locale: fr })}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Archive className="h-3.5 w-3.5" />
                          {format(new Date(client.dateArchivage), 'dd/MM/yyyy', { locale: fr })}
                        </div>
                      </div>

                      {/* Commentaire */}
                      <div className="flex items-start gap-2 min-w-[250px]">
                        <MessageCircle className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-1" />
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium">Commentaire</span>
                            <button
                              onClick={() => handleOpenCommentaire(client)}
                              className="text-xs text-primary hover:text-primary/80 transition-colors"
                            >
                              {client.commentaire ? '(modifier)' : '(ajouter)'}
                            </button>
                          </div>
                          {client.commentaire ? (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                              {client.commentaire}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground italic mt-0.5">
                              Aucun commentaire
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {historique.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6 text-muted-foreground"
                >
                  <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun contrat dans l'historique</p>
                </motion.div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <CommentaireModal
        isOpen={isCommentaireModalOpen}
        onClose={() => setIsCommentaireModalOpen(false)}
        commentaire={commentaireTemp}
        onChange={setCommentaireTemp}
        onSave={handleSaveCommentaire}
      />
    </RootLayout>
  )
}
