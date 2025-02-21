import { useEffect, useState } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Card, CardHeader, CardBody } from "@nextui-org/react";
import { clientService } from '../services/ClientService';
import { ClientHistorique } from '../types/historique';
import { format } from 'date-fns';

export default function ClientsArchives() {
  const [archives, setArchives] = useState<ClientHistorique[]>([]);

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = async () => {
    try {
      const archivesList = await clientService.getClientsArchives();
      setArchives(archivesList);
    } catch (error) {
      console.error('Erreur lors du chargement des archives:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-bold">Archives des clients</h1>
      </CardHeader>
      <CardBody>
        <Table aria-label="Table des archives">
          <TableHeader>
            <TableColumn>Client</TableColumn>
            <TableColumn>Entreprise</TableColumn>
            <TableColumn>Prestations</TableColumn>
            <TableColumn>Montant</TableColumn>
            <TableColumn>Fréquence</TableColumn>
            <TableColumn>Période</TableColumn>
            <TableColumn>Date d'archivage</TableColumn>
            <TableColumn>Commentaire</TableColumn>
          </TableHeader>
          <TableBody>
            {archives.map((archive) => (
              <TableRow key={archive.id}>
                <TableCell>{archive.prenom} {archive.nom}</TableCell>
                <TableCell>{archive.entreprise || '-'}</TableCell>
                <TableCell>
                  <ul className="list-disc list-inside">
                    {archive.typePrestations.map((type) => (
                      <li key={type}>{type}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>{archive.montant}€</TableCell>
                <TableCell>{archive.frequence}</TableCell>
                <TableCell>
                  <div>Du: {format(new Date(archive.dateDebut), 'dd/MM/yyyy')}</div>
                  {archive.dateFin && (
                    <div>Au: {format(new Date(archive.dateFin), 'dd/MM/yyyy')}</div>
                  )}
                </TableCell>
                <TableCell>{format(new Date(archive.dateArchivage), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{archive.commentaire}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
