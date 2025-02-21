import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { statistiquesService } from '../services/StatistiquesService'
import { RepartitionPrestation, StatsMensuelles } from '../types/statistiques'
import { clientService } from '../services/ClientService'

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']

interface CustomLabelProps {
  cx: number
  cy: number
  value: number
}

const CustomLabel = ({ cx, cy, value }: CustomLabelProps) => {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      {value}
    </text>
  )
}

const StatCard = ({ title, value, trend }: { title: string; value: number; trend?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
  >
    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
      <h3 className="tracking-tight text-sm font-medium">{title}</h3>
    </div>
    <div className="flex items-center space-x-2">
      <p className="text-2xl font-bold">{value}</p>
      {trend !== undefined && (
        <span className={trend >= 0 ? "text-green-600" : "text-red-600"}>
          {trend >= 0 ? "+" : ""}{trend}%
        </span>
      )}
    </div>
  </motion.div>
)

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
    <div className="p-6">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-4 h-[300px]">
        {children}
      </div>
    </div>
  </div>
)

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

  const getTrend = (stats: StatsMensuelles[]): number => {
    if (stats.length < 2) return 0
    const lastMonth = stats[stats.length - 1].ca
    const previousMonth = stats[stats.length - 2].ca
    return previousMonth === 0 ? 0 : Math.round(((lastMonth - previousMonth) / previousMonth) * 100)
  }

  return (
    <div className="container space-y-8 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Chiffre d'affaires mensuel"
          value={caMensuel}
          trend={getTrend(statsMensuelles)}
        />
        <StatCard
          title="Contrats actifs"
          value={nombreContrats}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Répartition des prestations">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={repartition}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="nombre"
              >
                {repartition.map((entry, index) => (
                  <Cell key={entry.type} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(_value: number, _name: string, props: any) => [
                  `${props.payload.nombre} contrats (${((props.payload.nombre / nombreContrats) * 100).toFixed(1)}%)`,
                  props.payload.type
                ]}
              />
              <Legend
                formatter={(value: string) => value}
                layout="vertical"
                align="right"
                verticalAlign="middle"
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
