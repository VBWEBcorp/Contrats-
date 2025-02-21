import { Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useForm, Controller } from 'react-hook-form'
import { Client, PrestationType } from '../types/client'
import { clientService } from '../services/ClientService'

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  clientToEdit?: Client
}

const TYPES_PRESTATIONS: PrestationType[] = [
  'SEO',
  'Dev Web',
  'Maintenance Dev Web',
  'Maintenance Site Web',
  'Site Internet'
]

export function ClientModal({ isOpen, onClose, clientToEdit }: ClientModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<Client>({
    defaultValues: {
      nom: '',
      prenom: '',
      entreprise: '',
      typePrestations: [],
      montant: 0,
      frequence: 'mensuel',
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: '',
      commentaire: ''
    }
  })

  useEffect(() => {
    if (clientToEdit) {
      reset({
        ...clientToEdit,
        dateDebut: new Date(clientToEdit.dateDebut).toISOString().split('T')[0],
        dateFin: clientToEdit.dateFin ? new Date(clientToEdit.dateFin).toISOString().split('T')[0] : ''
      })
    } else {
      reset({
        nom: '',
        prenom: '',
        entreprise: '',
        typePrestations: [],
        montant: 0,
        frequence: 'mensuel',
        dateDebut: new Date().toISOString().split('T')[0],
        dateFin: '',
        commentaire: ''
      })
    }
  }, [clientToEdit, reset])

  const onSubmit = (data: Client) => {
    if (clientToEdit) {
      clientService.updateClient({ ...data, id: clientToEdit.id })
    } else {
      clientService.addClient(data)
    }
    onClose()
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      {clientToEdit ? 'Modifier le client' : 'Ajouter un client'}
                    </Dialog.Title>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                          Prénom *
                        </label>
                        <input
                          type="text"
                          {...register('prenom', { required: 'Le prénom est requis' })}
                          className="mt-1 block w-full rounded-none border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-background"
                        />
                        {errors.prenom && (
                          <p className="mt-1 text-sm text-red-600">{errors.prenom.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                          Nom *
                        </label>
                        <input
                          type="text"
                          {...register('nom', { required: 'Le nom est requis' })}
                          className="mt-1 block w-full rounded-none border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-background"
                        />
                        {errors.nom && (
                          <p className="mt-1 text-sm text-red-600">{errors.nom.message}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="entreprise" className="block text-sm font-medium text-gray-700">
                        Entreprise
                      </label>
                      <input
                        type="text"
                        {...register('entreprise')}
                        className="mt-1 block w-full rounded-none border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-background"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="montant" className="block text-sm font-medium text-gray-700">
                          Montant (€) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          {...register('montant', {
                            required: 'Le montant est requis',
                            min: { value: 0, message: 'Le montant doit être positif' },
                            valueAsNumber: true
                          })}
                          className="mt-1 block w-full rounded-none border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-background"
                        />
                        {errors.montant && (
                          <p className="mt-1 text-sm text-red-600">{errors.montant.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="frequence" className="block text-sm font-medium text-gray-700">
                          Fréquence *
                        </label>
                        <select
                          {...register('frequence', { required: 'La fréquence est requise' })}
                          className="mt-1 block w-full rounded-none border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-background"
                        >
                          <option value="mensuel">Mensuel</option>
                          <option value="annuel">Annuel</option>
                        </select>
                        {errors.frequence && (
                          <p className="mt-1 text-sm text-red-600">{errors.frequence.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700">
                          Date de début *
                        </label>
                        <input
                          type="date"
                          {...register('dateDebut', { required: 'La date de début est requise' })}
                          className="mt-1 block w-full rounded-none border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-background"
                        />
                        {errors.dateDebut && (
                          <p className="mt-1 text-sm text-red-600">{errors.dateDebut.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700">
                          Date de fin
                        </label>
                        <input
                          type="date"
                          {...register('dateFin')}
                          className="mt-1 block w-full rounded-none border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-background"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Types de prestations *
                      </label>
                      <Controller
                        name="typePrestations"
                        control={control}
                        rules={{ required: 'Sélectionnez au moins un type de prestation' }}
                        render={({ field }) => (
                          <div className="mt-2 space-y-2">
                            {TYPES_PRESTATIONS.map((type) => (
                              <div key={type} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={type}
                                  value={type}
                                  checked={field.value.includes(type)}
                                  onChange={(e) => {
                                    const value = e.target.value as PrestationType
                                    const newValue = e.target.checked
                                      ? [...field.value, value]
                                      : field.value.filter((v) => v !== value)
                                    field.onChange(newValue)
                                  }}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor={type} className="ml-2 text-sm text-gray-700">
                                  {type}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      />
                      {errors.typePrestations && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.typePrestations.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        reset()
                      }}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {clientToEdit ? 'Modifier' : 'Ajouter'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
