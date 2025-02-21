import { useState, useEffect } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Card, CardHeader, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Textarea } from "@nextui-org/react";
import { Client } from '../types/client';
import { clientService } from '../services/ClientService';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ClientModal from './ClientModal';

export default function ClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveComment, setArchiveComment] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const data = await clientService.getClients();
    setClients(data);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleArchive = (client: Client) => {
    setSelectedClient(client);
    setIsArchiveModalOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (selectedClient && archiveComment) {
      const success = await clientService.archiveClient(selectedClient, archiveComment);
      if (success) {
        setIsArchiveModalOpen(false);
        setArchiveComment('');
        loadClients();
      }
    }
  };

  const handleSave = async (client: Client) => {
    let success;
    if (client.id) {
      success = await clientService.updateClient(client);
    } else {
      success = await clientService.addClient({
        nom: client.nom,
        prenom: client.prenom,
        entreprise: client.entreprise,
        typePrestations: client.typePrestations,
        montant: client.montant,
        frequence: client.frequence,
        dateDebut: client.dateDebut,
        dateFin: client.dateFin,
        archive: false
      });
    }
    
    if (success) {
      setIsModalOpen(false);
      loadClients();
    }
  };

  return (
    <Card className="max-w-[1200px] mx-auto">
      <CardHeader className="flex justify-between">
        <h1 className="text-2xl">Liste des Clients</h1>
        <Button color="primary" onPress={() => {
          setSelectedClient(null);
          setIsModalOpen(true);
        }}>
          Ajouter un client
        </Button>
      </CardHeader>
      <CardBody>
        <Table aria-label="Liste des clients">
          <TableHeader>
            <TableColumn>Nom</TableColumn>
            <TableColumn>Prénom</TableColumn>
            <TableColumn>Entreprise</TableColumn>
            <TableColumn>Type de prestations</TableColumn>
            <TableColumn>Montant</TableColumn>
            <TableColumn>Fréquence</TableColumn>
            <TableColumn>Date de début</TableColumn>
            <TableColumn>Date de fin</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.nom}</TableCell>
                <TableCell>{client.prenom}</TableCell>
                <TableCell>{client.entreprise || '-'}</TableCell>
                <TableCell>{client.typePrestations.join(', ')}</TableCell>
                <TableCell>{client.montant}€</TableCell>
                <TableCell>{client.frequence}</TableCell>
                <TableCell>{format(new Date(client.dateDebut), 'dd/MM/yyyy')}</TableCell>
                <TableCell>
                  {client.dateFin ? format(new Date(client.dateFin), 'dd/MM/yyyy') : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" color="primary" onPress={() => handleEdit(client)}>
                      Modifier
                    </Button>
                    <Button size="sm" color="danger" onPress={() => handleArchive(client)}>
                      Archiver
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        client={selectedClient}
      />

      <Modal isOpen={isArchiveModalOpen} onClose={() => setIsArchiveModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Archiver le client</ModalHeader>
          <ModalBody>
            <p>Voulez-vous vraiment archiver ce client ?</p>
            <Textarea
              label="Commentaire d'archivage"
              placeholder="Raison de l'archivage..."
              value={archiveComment}
              onChange={(e) => setArchiveComment(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => setIsArchiveModalOpen(false)}>
              Annuler
            </Button>
            <Button color="primary" onPress={handleArchiveConfirm}>
              Confirmer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
}
