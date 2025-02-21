import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@nextui-org/react";
import { useForm, Controller } from 'react-hook-form';
import { Client, TYPES_PRESTATIONS, FrequenceType, PrestationType } from '../types/client';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Client, 'id'>) => void;
  client?: Client;
}

export default function ClientModal({ isOpen, onClose, onSubmit, client }: ClientModalProps) {
  const { control, handleSubmit, reset } = useForm<Omit<Client, 'id'>>({
    defaultValues: {
      nom: client?.nom || '',
      prenom: client?.prenom || '',
      entreprise: client?.entreprise || '',
      typePrestations: client?.typePrestations || [],
      montant: client?.montant || 0,
      frequence: client?.frequence || 'mensuel',
      dateDebut: client?.dateDebut || new Date().toISOString().split('T')[0],
      dateFin: client?.dateFin || ''
    }
  });

  React.useEffect(() => {
    if (client) {
      reset({
        nom: client.nom,
        prenom: client.prenom,
        entreprise: client.entreprise,
        typePrestations: client.typePrestations,
        montant: client.montant,
        frequence: client.frequence,
        dateDebut: client.dateDebut,
        dateFin: client.dateFin
      });
    }
  }, [client, reset]);

  const handleFormSubmit = (data: Omit<Client, 'id'>) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader>{client ? 'Modifier le client' : 'Ajouter un client'}</ModalHeader>
          <ModalBody className="gap-4">
            <Controller
              name="nom"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Nom"
                  placeholder="Nom du client"
                />
              )}
            />
            <Controller
              name="prenom"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Prénom"
                  placeholder="Prénom du client"
                />
              )}
            />
            <Controller
              name="entreprise"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Entreprise"
                  placeholder="Nom de l'entreprise"
                />
              )}
            />
            <Controller
              name="typePrestations"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Types de prestations"
                  placeholder="Sélectionnez les types de prestations"
                  selectionMode="multiple"
                >
                  {TYPES_PRESTATIONS.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
            <Controller
              name="montant"
              control={control}
              rules={{ required: true, min: 0 }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  label="Montant"
                  placeholder="Montant"
                />
              )}
            />
            <Controller
              name="frequence"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Fréquence"
                  placeholder="Sélectionnez la fréquence"
                >
                  <SelectItem key="mensuel" value="mensuel">Mensuel</SelectItem>
                  <SelectItem key="annuel" value="annuel">Annuel</SelectItem>
                </Select>
              )}
            />
            <Controller
              name="dateDebut"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                  label="Date de début"
                />
              )}
            />
            <Controller
              name="dateFin"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                  label="Date de fin"
                />
              )}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Annuler
            </Button>
            <Button color="primary" type="submit">
              {client ? 'Modifier' : 'Ajouter'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
