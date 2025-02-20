import { Users, History, TrendingUp } from 'lucide-react'

interface NavigationProps {
  activeTab: 'clients' | 'historique' | 'statistiques'
  onChangeTab: (tab: 'clients' | 'historique' | 'statistiques') => void
}

export function Navigation({ activeTab, onChangeTab }: NavigationProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          onClick={() => onChangeTab('clients')}
          className={`
            ${
              activeTab === 'clients'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }
            flex whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
          `}
        >
          <Users
            className={`mr-2 h-5 w-5 ${
              activeTab === 'clients' ? 'text-blue-500' : 'text-gray-400'
            }`}
          />
          Clients actuels
        </button>

        <button
          onClick={() => onChangeTab('historique')}
          className={`
            ${
              activeTab === 'historique'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }
            flex whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
          `}
        >
          <History
            className={`mr-2 h-5 w-5 ${
              activeTab === 'historique' ? 'text-blue-500' : 'text-gray-400'
            }`}
          />
          Historique
        </button>

        <button
          onClick={() => onChangeTab('statistiques')}
          className={`
            ${
              activeTab === 'statistiques'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }
            flex whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
          `}
        >
          <TrendingUp
            className={`mr-2 h-5 w-5 ${
              activeTab === 'statistiques' ? 'text-blue-500' : 'text-gray-400'
            }`}
          />
          Statistiques
        </button>
      </nav>
    </div>
  )
}
