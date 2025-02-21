import { useState } from 'react'
import { Users } from 'lucide-react'
import ClientsList from './components/ClientsList'
import { HistoriqueList } from './components/HistoriqueList'
import { Statistiques } from './components/Statistiques'
import { Navigation } from './components/Navigation'

function App() {
  const [activeTab, setActiveTab] = useState<'clients' | 'historique' | 'statistiques'>('clients')

  const renderContent = () => {
    switch (activeTab) {
      case 'clients':
        return <ClientsList />
      case 'historique':
        return <HistoriqueList />
      case 'statistiques':
        return <Statistiques />
      default:
        return <ClientsList />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Gestion des Contrats
            </h1>
          </div>
          <div className="mt-4">
            <Navigation activeTab={activeTab} onChangeTab={setActiveTab} />
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default App
