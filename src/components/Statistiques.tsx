import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'
import { TrendingUp, Users } from 'lucide-react'
import { clientService } from '../services/ClientService'
import { statistiquesService, StatsMensuelles, RepartitionPrestation } from '../services/StatistiquesService'

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']
const RADIAN = Math.PI / 180

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function Statistiques() {
  const [statsMensuelles, setStatsMensuelles] = useState<StatsMensuelles[]>([])
  const [repartition, setRepartition] = useState<RepartitionPrestation[]>([])
  const [caMensuel, setCaMensuel] = useState(0)
  const [nombreContrats, setNombreContrats] = useState(0)

  useEffect(() => {
    const mettreAJourStats = () => {
      const clients = clientService.getClients()
      setStatsMensuelles(statistiquesService.calculerHistoriqueMensuel())
      setRepartition(statistiquesService.calculerRepartitionPrestations(clients))
      setCaMensuel(statistiquesService.calculerCAMensuel(clients))
      setNombreContrats(clients.length)
    }

    mettreAJourStats()
    const unsubscribe = clientService.subscribe(mettreAJourStats)
    return () => unsubscribe()
  }, [])

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Chiffre d'affaires mensuel</p>
              <p className="text-2xl font-semibold text-gray-900">
                {caMensuel.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Contrats actifs</p>
              <p className="text-2xl font-semibold text-gray-900">{nombreContrats}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Répartition des prestations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Répartition des prestations</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={repartition}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="nombre"
                >
                  {repartition.map((entry, index) => (
                    <Cell key={entry.type} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, props: any) => [
                    `${value} contrats (${((value / nombreContrats) * 100).toFixed(1)}%)`,
                    props.payload.type
                  ]}
                />
                <Legend
                  formatter={(value, entry) => entry.payload.type}
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Évolution du CA */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Évolution du CA mensuel</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsMensuelles}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(value) =>
                    new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                      maximumFractionDigits: 0,
                      notation: 'compact'
                    }).format(value)
                  }
                />
                <Tooltip
                  formatter={(value: any) =>
                    new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(value)
                  }
                />
                <Bar
                  dataKey="ca"
                  fill="#2563eb"
                  name="Chiffre d'affaires"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Évolution du nombre de contrats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Évolution du nombre de contrats</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statsMensuelles}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="nombreContrats"
                  stroke="#2563eb"
                  strokeWidth={2}
                  name="Nombre de contrats"
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comparaison mensuelle */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Comparaison CA / Contrats</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statsMensuelles}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(value) =>
                    new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                      maximumFractionDigits: 0,
                      notation: 'compact'
                    }).format(value)
                  }
                />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="ca"
                  stroke="#2563eb"
                  strokeWidth={2}
                  name="CA"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="nombreContrats"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  name="Contrats"
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
