import { useEffect, useState } from 'react';
import { ClientHistorique } from '../types/client';
import { ClientService } from '../services/ClientService';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Card, CardHeader } from "@nextui-org/react";

export default function ClientsArchives() {
  const [archives, setArchives] = useState<ClientHistorique[]>([]);

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = async () => {
    try {
      const archivesList = await ClientService.getClientsArchives();
      setArchives(archivesList);
    } catch (error) {
      console.error('Erreur lors du chargement des archives:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">Historique des clients archivés</h2>
      </CardHeader>
      <Table aria-label="Table des clients archivés">
        <TableHeader>
          <TableColumn>ID Client</TableColumn>
          <TableColumn>Date d'archivage</TableColumn>
          <TableColumn>Commentaire</TableColumn>
        </TableHeader>
        <TableBody>
          {archives.map((archive) => (
            <TableRow key={archive.id}>
              <TableCell>{archive.client_id}</TableCell>
              <TableCell>{new Date(archive.dateArchivage).toLocaleDateString()}</TableCell>
              <TableCell>{archive.commentaire}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
