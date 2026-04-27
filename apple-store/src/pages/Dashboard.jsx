import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  TrendingUp, ShoppingBag, Users, DollarSign,
  ArrowUpRight, ArrowDownRight, Bell, Calendar,
} from 'lucide-react'
import { cashFlowData } from '@/data/mockData'
import { useApp } from '@/context/AppContext'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

const periods = [
  { key: 'hoje', label: 'Hoje' },
  { key: 'semana', label: 'Semana' },
  { key: 'mes', label: 'Mês' },
  { key: 'ano', label: 'Ano' },
]

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-bold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 1000 ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

const tv = (s) =>
  s.totalValue ?? s.value ?? s.payments?.reduce((a, p) => a + (parseFloat(p.value) || 0), 0) ?? 0

export default function Dashboard() {
  const [period, setPeriod] = useState('mes')
  const { sales, followUpAlerts, darkMode } = useApp()

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const todayStr = today.toISOString().split('T')[0]

  const periodStart = useMemo(() => {
    const semana = new Date(today)
    semana.setDate(semana.getDate() - 6)
    return {
      hoje: today,
      semana,
      mes: new Date(today.getFullYear(), today.getMonth(), 1),
      ano: new Date(today.getFullYear(), 0, 1),
    }
  }, [today])

  const filteredSales = useMemo(() => {
    const start = periodStart[period]
    return sales.filter((s) => new Date(s.date + 'T00:00:00') >= start)
  }, [sales, period, periodStart])

  const faturamento = filteredSales.reduce((acc, s) => acc + tv(s), 0)
  const vendas = filteredSales.length
  const ticketMedio = vendas > 0 ? faturamento / vendas : 0
  const clientesNovos = new Set(filteredSales.map((s) => s.clientName)).size

  const chartData = useMemo(() => {
    if (period === 'hoje') {
      const total = sales.filter((s) => s.date === todayStr).reduce((a, s) => a + tv(s), 0)
      return [{ name: 'Hoje', faturamento: total }]
    }

    if (period === 'semana') {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today)
        d.setDate(d.getDate() - (6 - i))
        const dateStr = d.toISOString().split('T')[0]
        return {
          name: DAYS_PT[d.getDay()],
          faturamento: sales.filter((s) => s.date === dateStr).reduce((a, s) => a + tv(s), 0),
        }
      })
    }

    if (period === 'mes') {
      const year = today.getFullYear()
      const month = today.getMonth()
      const days = new Date(year, month + 1, 0).getDate()
      return Array.from({ length: days }, (_, i) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
        return {
          name: String(i + 1),
          faturamento: sales.filter((s) => s.date === dateStr).reduce((a, s) => a + tv(s), 0),
        }
      })
    }

    // ano
    const year = today.getFullYear()
    return MONTHS_PT.map((name, i) => {
      const monthStr = `${year}-${String(i + 1).padStart(2, '0')}`
      return {
        name,
        faturamento: sales.filter((s) => s.date.startsWith(monthStr)).reduce((a, s) => a + tv(s), 0),
      }
    })
  }, [sales, period, today, todayStr])

  const axisColor = darkMode ? '#4b5563' : '#d1d5db'
  const tickColor = darkMode ? '#9ca3af' : '#6b7280'
  const gridColor = darkMode ? '#1f2937' : '#f3f4f6'

  const cards = [
    { title: 'Faturamento', value: fmt(faturamento), icon: DollarSign, change: '+12.5%', up: true, iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' },
    { title: 'Vendas', value: vendas.toLocaleString('pt-BR'), icon: ShoppingBag, change: '+8.2%', up: true, iconBg: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600 dark:text-green-400' },
    { title: 'Ticket Médio', value: fmt(ticketMedio), icon: TrendingUp, change: '+3.1%', up: true, iconBg: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400' },
    { title: 'Clientes', value: clientesNovos.toLocaleString('pt-BR'), icon: Users, change: '-2.3%', up: false, iconBg: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-600 dark:text-orange-400' },
  ]

  const recentSales = [...sales].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6)

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Bom dia, Admin 👋</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Aqui está o resumo da loja</p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl self-start flex-shrink-0">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-2.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                period === p.key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.title} className="border-0 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{c.title}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.iconBg}`}>
                  <c.icon className={`w-4 h-4 ${c.iconColor}`} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{c.value}</p>
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${c.up ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {c.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {c.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Faturamento chart */}
        <Card className="xl:col-span-3 border-0 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">Faturamento por período</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={chartData} barSize={period === 'mes' ? 8 : period === 'ano' ? 14 : 28}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: darkMode ? '#1f2937' : '#f9fafb' }} />
                <Bar dataKey="faturamento" name="Faturamento" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alerts section */}
        <Card className="xl:col-span-2 border-0 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-500" />
              Follow-ups Pendentes
              {followUpAlerts.length > 0 && (
                <span className="ml-auto text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 font-bold px-2 py-0.5 rounded-full">
                  {followUpAlerts.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {followUpAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="w-8 h-8 text-gray-200 dark:text-gray-700 mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">Nenhum follow-up pendente</p>
              </div>
            ) : (
              <div className="space-y-1">
                {followUpAlerts.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{lead.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">{lead.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{lead.product}</p>
                      {lead.followUpDate && (
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3 text-orange-500" />
                          <span className="text-[11px] text-orange-500 dark:text-orange-400 font-medium">{fmtDate(lead.followUpDate)}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {new Intl.NumberFormat('pt-BR', { notation: 'compact', currency: 'BRL', style: 'currency' }).format(lead.value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cash flow chart */}
      <Card className="border-0 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">Fluxo de Caixa — Ano</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={cashFlowData}>
              <defs>
                <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={darkMode ? 0.25 : 0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradSaidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={darkMode ? 0.25 : 0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span style={{ color: tickColor, fontSize: 12 }}>{v}</span>} />
              <Area dataKey="entradas" name="Entradas" stroke="#2563eb" strokeWidth={2} fill="url(#gradEntradas)" dot={false} />
              <Area dataKey="saidas" name="Saídas" stroke="#ef4444" strokeWidth={2} fill="url(#gradSaidas)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Sales */}
      <Card className="border-0 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">Vendas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-3 border-b dark:border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{sale.clientName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{sale.clientName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{sale.product}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{fmt(tv(sale))}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    sale.status === 'pago' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {sale.status === 'pago' ? 'Pago' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
