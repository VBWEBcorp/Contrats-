import { useState, useEffect } from 'react'
import { Plus, Users2, Euro, Trash2, Edit2, Building2, CalendarRange, MoreVertical } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpring, animated } from 'react-spring'
import { Client, PrestationType, TYPES_PRESTATIONS } from '../types/client'
import { ClientModal } from './ClientModal'
import { clientService } from '../services/ClientService'
import { RootLayout, PageHeader, PageHeaderHeading, PageHeaderDescription } from './layout/RootLayout'
import { formatPrice } from '../lib/utils'
import { Card, CardBody, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react"
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const PrestationBadge = ({ type }: { type: PrestationType }) => {
  const colors: Record<PrestationType, string> = {
    'Développement web': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Design UI/UX': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'SEO': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Marketing digital': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Maintenance': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}>
      {type}
    </span>
  )
}

export function ClientsList() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined)

  useEffect(() => {
    const updateClients = () => {
      const currentClients = clientService.getClients()
      setClients(currentClients)
    }

    updateClients()
    const unsubscribe = clientService.subscribe(updateClients)
    return () => unsubscribe()
  }, [])

  const handleAddClient = (clientData: Omit<Client, 'id'>) => {
    clientService.addClient(clientData)
    setIsModalOpen(false)
  }

  const totalMensuel = clients.reduce((total, client) => {
    // S'assurer que le montant est un nombre
    const montant = typeof client.montant === 'string' ? parseFloat(client.montant) : client.montant
    
    // Calculer le montant mensuel selon la fréquence
    const montantMensuel = client.frequence === 'mensuel' ? montant : montant / 12
    
    // Ajouter au total
    return total + montantMensuel
  }, 0)

  // Arrondir le total à 2 décimales
  const totalArrondi = Math.round(totalMensuel * 100) / 100

  const totalProps = useSpring({
    number: totalArrondi,
    from: { number: 0 },
    config: { mass: 1, tension: 20, friction: 10 },
  })

  return (
    <RootLayout>
      <PageHeader>
        <div>
          <PageHeaderHeading>Clients actuels</PageHeaderHeading>
          <PageHeaderDescription>
            Gérez vos clients actifs et suivez vos revenus mensuels
          </PageHeaderDescription>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="btn-primary hidden md:flex"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un client
        </motion.button>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="md:hidden"
          color="primary"
          size="sm"
          isIconOnly
        >
          <Plus className="h-4 w-4" />
        </Button>
      </PageHeader>

      <div className="container py-6">
        <Card className="shadow-glass backdrop-glass">
          <CardBody>
            <div className="space-y-2">
              <AnimatePresence>
                {clients.map((client, index) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                      {/* Informations client */}
                      <div className="min-w-[200px] flex items-start justify-between">
                        <div>
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
                        {/* Menu burger pour mobile */}
                        <div className="md:hidden">
                          <Dropdown>
                            <DropdownTrigger>
                              <Button 
                                isIconOnly
                                variant="light"
                                size="sm"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Actions">
                              <DropdownItem
                                key="edit"
                                startContent={<Edit2 className="h-4 w-4" />}
                                onClick={() => {
                                  setSelectedClient(client)
                                  setIsModalOpen(true)
                                }}
                              >
                                Modifier
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                className="text-danger"
                                color="danger"
                                startContent={<Trash2 className="h-4 w-4" />}
                                onClick={() => {
                                  if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
                                    clientService.deleteClient(client.id)
                                  }
                                }}
                              >
                                Supprimer
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
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
                          {formatPrice(client.montant)}
                        </span>
                        <span className="text-xs text-muted-foreground">/{client.frequence}</span>
                      </div>

                      {/* Dates */}
                      <div className="flex items-center gap-1 min-w-[200px] text-sm text-muted-foreground">
                        <CalendarRange className="h-3.5 w-3.5" />
                        <div>
                          {format(new Date(client.dateDebut), 'dd/MM/yyyy', { locale: fr })}
                          {client.dateFin && (
                            <> → {format(new Date(client.dateFin), 'dd/MM/yyyy', { locale: fr })}</>
                          )}
                        </div>
                      </div>

                      {/* Actions pour desktop */}
                      <div className="hidden md:flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedClient(client)
                            setIsModalOpen(true)
                          }}
                          className="p-1.5 rounded-md hover:bg-muted/80 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
                              clientService.deleteClient(client.id)
                            }
                          }}
                          className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {clients.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6 text-muted-foreground"
                >
                  <Users2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun client actif</p>
                </motion.div>
              )}

              {/* Total mensuel avec animation */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 pt-4 border-t"
              >
                <div className="flex items-center justify-between px-3">
                  <div className="flex items-center gap-2">
                    <Euro className="h-3.5 w-3.5 text-primary" />
                    <h3 className="font-medium">Total mensuel</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(totalArrondi)}
                    </span>
                    <span className="text-sm text-muted-foreground">/mois</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </CardBody>
        </Card>
      </div>

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedClient(undefined)
        }}
        onSubmit={handleAddClient}
        client={selectedClient}
      />
    </RootLayout>
  )
}
