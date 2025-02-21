import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@nextui-org/react";
import { Client, PrestationType, TYPES_PRESTATIONS } from '../types/client';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Client, 'id' | 'archive'>) => void;
  client?: Client;
}

export default function ClientModal({ isOpen, onClose, onSubmit, client }: ClientModalProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<Omit<Client, 'id' | 'archive'>>({
    defaultValues: client ? {
      nom: client.nom,
      prenom: client.prenom,
      entreprise: client.entreprise,
      typePrestations: client.typePrestations,
      montant: client.montant,
      frequence: client.frequence,
      dateDebut: client.dateDebut,
      dateFin: client.dateFin
    } : {
      nom: '',
      prenom: '',
      entreprise: '',
      typePrestations: [],
      montant: 0,
      frequence: 'mensuel',
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: ''
    }
  });

  const handleFormSubmit = (data: Omit<Client, 'id' | 'archive'>) => {
    onSubmit({
      ...data,
      montant: Number(data.montant),
      typePrestations: Array.isArray(data.typePrestations) ? data.typePrestations : [data.typePrestations as PrestationType]
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {client ? 'Modifier le client' : 'Ajouter un client'}
            </h3>
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 gap-4">
              <Input
                {...register('nom', { required: 'Le nom est requis' })}
                label="Nom"
                placeholder="Nom"
                errorMessage={errors.nom?.message}
              />
              <Input
                {...register('prenom', { required: 'Le prénom est requis' })}
                label="Prénom"
                placeholder="Prénom"
                errorMessage={errors.prenom?.message}
              />
              <Input
                {...register('entreprise')}
                label="Entreprise"
                placeholder="Entreprise (optionnel)"
              />
              <Controller
                name="typePrestations"
                control={control}
                rules={{ required: 'Au moins une prestation est requise' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Types de prestations"
                    placeholder="Sélectionnez les prestations"
                    selectionMode="multiple"
                    errorMessage={errors.typePrestations?.message}
                  >
                    {TYPES_PRESTATIONS.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
              <Input
                type="number"
                {...register('montant', { 
                  required: 'Le montant est requis',
                  min: { value: 0, message: 'Le montant doit être positif' }
                })}
                label="Montant"
                placeholder="Montant"
                errorMessage={errors.montant?.message}
              />
              <Controller
                name="frequence"
                control={control}
                rules={{ required: 'La fréquence est requise' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Fréquence"
                    placeholder="Sélectionnez la fréquence"
                    errorMessage={errors.frequence?.message}
                  >
                    <SelectItem key="mensuel" value="mensuel">Mensuel</SelectItem>
                    <SelectItem key="annuel" value="annuel">Annuel</SelectItem>
                  </Select>
                )}
              />
              <Controller
                name="dateDebut"
                control={control}
                rules={{ required: 'La date de début est requise' }}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        field.onChange(format(date, 'yyyy-MM-dd'));
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholderText="Date de début"
                  />
                )}
              />
              <Controller
                name="dateFin"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        field.onChange(format(date, 'yyyy-MM-dd'));
                      } else {
                        field.onChange('');
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholderText="Date de fin (optionnel)"
                    isClearable
                  />
                )}
              />
            </div>
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
