import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'
import { TrendingUp, Users, Activity, PieChart as PieChartIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { clientService } from '../services/ClientService'
import { statistiquesService, StatsMensuelles, RepartitionPrestation } from '../services/StatistiquesService'
import { RootLayout, PageHeader, PageHeaderHeading } from './layout/RootLayout'
import { cn, fadeIn, formatPrice } from '../lib/utils'

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

const StatCard = ({ title, value, icon: Icon, trend }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="card"
  >
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p className={cn(
              "text-sm mt-1",
              trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-muted-foreground"
            )}>
              {trend > 0 ? "+" : ""}{trend}% vs mois précédent
            </p>
          )}
        </div>
        <div className="rounded-full p-3 bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  </motion.div>
)

const ChartCard = ({ title, icon: Icon, children }: any) => (
  <motion.div
    variants={fadeIn}
    initial="initial"
    animate="animate"
    exit="exit"
    className="card"
  >
    <div className="card-header">
      <div className="flex items-center space-x-2">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="card-title text-lg">{title}</h3>
      </div>
    </div>
    <div className="p-6 pt-0">
      <div className="h-80">
        {children}
      </div>
    </div>
  </motion.div>
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

  // Calcul de la tendance (pour l'exemple, à adapter selon vos besoins)
  const getTrend = (data: StatsMensuelles[]) => {
    if (data.length < 2) return 0
    const lastTwo = data.slice(-2)
    const previous = lastTwo[0].ca
    const current = lastTwo[1].ca
    return previous === 0 ? 0 : ((current - previous) / previous * 100).toFixed(1)
  }

  return (
    <RootLayout>
      <PageHeader>
        <PageHeaderHeading>Tableau de bord</PageHeaderHeading>
      </PageHeader>

      <div className="container space-y-8 pb-10">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Chiffre d'affaires mensuel"
            value={formatPrice(caMensuel)}
            icon={TrendingUp}
            trend={getTrend(statsMensuelles)}
          />
          <StatCard
            title="Contrats actifs"
            value={nombreContrats}
            icon={Users}
          />
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Répartition des prestations" icon={PieChartIcon}>
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
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Legend
                  formatter={(value, entry) => entry.payload.type}
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Évolution du CA mensuel" icon={TrendingUp}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsMensuelles}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                />
                <YAxis
                  tickFormatter={(value) => formatPrice(value, { notation: 'compact' })}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip
                  formatter={(value: any) => formatPrice(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Bar
                  dataKey="ca"
                  fill="hsl(var(--primary))"
                  name="Chiffre d'affaires"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Évolution du nombre de contrats" icon={Activity}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statsMensuelles}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                />
                <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="nombreContrats"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Nombre de contrats"
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Comparaison CA / Contrats" icon={TrendingUp}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statsMensuelles}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(value) => formatPrice(value, { notation: 'compact' })}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === "Chiffre d'affaires") return formatPrice(value)
                    return value
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="ca"
                  stroke="hsl(var(--primary))"
                  name="Chiffre d'affaires"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="nombreContrats"
                  stroke="hsl(var(--secondary))"
                  name="Nombre de contrats"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--secondary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </RootLayout>
  )
}
