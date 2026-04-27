import { useState, useMemo } from 'react'
import {
  Plus, Trash2, TrendingUp, TrendingDown, DollarSign, AlertCircle,
  Pencil, Check, X, ChevronLeft, ChevronRight, BarChart2, LineChartIcon,
  Download, Info, Tag, List,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts'
import { useApp } from '@/context/AppContext'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const fmtPct = (v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function parseMonth(ym) {
  const [y, m] = ym.split('-').map(Number)
  return { year: y, month: m }
}
function toYM(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`
}
function prevYM(ym) {
  const { year, month } = parseMonth(ym)
  return month === 1 ? toYM(year - 1, 12) : toYM(year, month - 1)
}
function nextYM(ym) {
  const { year, month } = parseMonth(ym)
  return month === 12 ? toYM(year + 1, 1) : toYM(year, month + 1)
}
function labelYM(ym) {
  const { year, month } = parseMonth(ym)
  return `${MONTHS_PT[month - 1]} ${year}`
}

// ─── Initial data (migrated to month-based structure) ─────────────────────────

const INITIAL_ENTRIES = [
  { id: 'e1', label: 'Venda iPhone 15 Pro — Carlos Silva', value: 8999, month: '2026-04', category: 'receita', grupo: 'iPhone' },
  { id: 'e2', label: 'Venda MacBook Air M2 — Ana Souza', value: 12999, month: '2026-04', category: 'receita', grupo: 'MacBook' },
  { id: 'e3', label: 'Venda iPad Pro M4 — Roberto Lima', value: 9499, month: '2026-04', category: 'receita', grupo: 'iPad' },
  { id: 'e4', label: 'Venda Apple Watch S9 — Fernanda Costa', value: 4299, month: '2026-04', category: 'receita', grupo: 'Acessórios' },
  { id: 'e5', label: 'Venda AirPods Pro — Pedro Alves', value: 2299, month: '2026-04', category: 'receita', grupo: 'Acessórios' },
  { id: 'e6', label: 'Venda iPhone 15 — Juliana Martins', value: 6999, month: '2026-04', category: 'receita', grupo: 'iPhone' },
  { id: 'e7', label: 'Venda MacBook Pro M3 — Marcos Paulo', value: 19999, month: '2026-04', category: 'receita', grupo: 'MacBook' },
  // Previous months for trend chart
  { id: 'e8', label: 'Receitas Janeiro', value: 38000, month: '2026-01', category: 'receita', grupo: 'iPhone' },
  { id: 'e9', label: 'Receitas Fevereiro', value: 42000, month: '2026-02', category: 'receita', grupo: 'MacBook' },
  { id: 'e10', label: 'Receitas Março', value: 55000, month: '2026-03', category: 'receita', grupo: 'iPhone' },
  // Fixed costs
  { id: 'cf1', label: 'Aluguel da loja', value: 8000, month: '2026-04', category: 'custo_fixo', grupo: '' },
  { id: 'cf2', label: 'Salários — 3 vendedores', value: 15000, month: '2026-04', category: 'custo_fixo', grupo: '' },
  { id: 'cf3', label: 'Internet e telefone', value: 450, month: '2026-04', category: 'custo_fixo', grupo: '' },
  { id: 'cf4', label: 'Seguro patrimonial', value: 1200, month: '2026-04', category: 'custo_fixo', grupo: '' },
  { id: 'cf5', label: 'Sistema de gestão (SaaS)', value: 350, month: '2026-04', category: 'custo_fixo', grupo: '' },
  { id: 'cf6', label: 'Custos Fixos Janeiro', value: 24000, month: '2026-01', category: 'custo_fixo', grupo: '' },
  { id: 'cf7', label: 'Custos Fixos Fevereiro', value: 24500, month: '2026-02', category: 'custo_fixo', grupo: '' },
  { id: 'cf8', label: 'Custos Fixos Março', value: 25000, month: '2026-03', category: 'custo_fixo', grupo: '' },
  // Variable costs
  { id: 'cv1', label: 'Reposição estoque iPhone 15 Pro (10 un)', value: 71990, month: '2026-04', category: 'custo_variavel', grupo: '' },
  { id: 'cv2', label: 'Reposição estoque MacBook Air (5 un)', value: 54995, month: '2026-04', category: 'custo_variavel', grupo: '' },
  { id: 'cv3', label: 'Comissão vendedores', value: 3200, month: '2026-04', category: 'custo_variavel', grupo: '' },
  { id: 'cv4', label: 'Marketing digital — Meta Ads', value: 2500, month: '2026-04', category: 'custo_variavel', grupo: '' },
  { id: 'cv5', label: 'Frete e logística', value: 800, month: '2026-04', category: 'custo_variavel', grupo: '' },
  { id: 'cv6', label: 'Custos Variáveis Janeiro', value: 18000, month: '2026-01', category: 'custo_variavel', grupo: '' },
  { id: 'cv7', label: 'Custos Variáveis Fevereiro', value: 20000, month: '2026-02', category: 'custo_variavel', grupo: '' },
  { id: 'cv8', label: 'Custos Variáveis Março', value: 22000, month: '2026-03', category: 'custo_variavel', grupo: '' },
]

// ─── MonthSelector ────────────────────────────────────────────────────────────

function MonthSelector({ value, onChange }) {
  const [picking, setPicking] = useState(false)
  const { year } = parseMonth(value)

  return (
    <div className="flex items-center gap-2 relative">
      <button
        onClick={() => onChange(prevYM(value))}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>

      <button
        onClick={() => setPicking((v) => !v)}
        className="text-sm font-semibold text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[160px] text-center"
      >
        {labelYM(value)}
      </button>

      <button
        onClick={() => onChange(nextYM(value))}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>

      {picking && (
        <div className="absolute top-10 left-0 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3 w-64">
          <div className="flex items-center justify-between mb-2 px-1">
            <button onClick={() => onChange(toYM(year - 1, parseMonth(value).month))} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{year}</span>
            <button onClick={() => onChange(toYM(year + 1, parseMonth(value).month))} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {MONTHS_PT.map((m, i) => {
              const ym = toYM(year, i + 1)
              const active = ym === value
              return (
                <button
                  key={m}
                  onClick={() => { onChange(ym); setPicking(false) }}
                  className={`text-xs py-1.5 rounded-lg font-medium transition-colors ${active ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                >
                  {m.slice(0, 3)}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg text-xs space-y-1">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color ?? p.fill }}>{p.name}: <span className="font-bold">{fmt(p.value)}</span></p>
      ))}
    </div>
  )
}

// ─── InfoTooltip ──────────────────────────────────────────────────────────────

function InfoTooltip({ text }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative inline-flex">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="ml-1"
      >
        <Info className="w-3 h-3 text-gray-400 dark:text-gray-500" />
      </button>
      {show && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 bg-gray-900 dark:bg-gray-700 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg w-48 text-center leading-tight pointer-events-none">
          {text}
        </div>
      )}
    </div>
  )
}

// ─── DRE Summary Cards ────────────────────────────────────────────────────────

function DRESummaryCards({ receita, custoFixo, custoVariavel, prevReceita, prevFixo, prevVariavel }) {
  const totalReceita = receita.reduce((s, i) => s + i.value, 0)
  const totalFixo = custoFixo.reduce((s, i) => s + i.value, 0)
  const totalVariavel = custoVariavel.reduce((s, i) => s + i.value, 0)
  const lucro = totalReceita - totalFixo - totalVariavel
  const margem = totalReceita > 0 ? ((lucro / totalReceita) * 100).toFixed(1) : '0.0'
  const isNeg = lucro < 0

  const pctChange = (curr, prev) => {
    if (!prev) return null
    return ((curr - prev) / prev) * 100
  }

  const cards = [
    {
      label: 'Receita Total',
      value: fmt(totalReceita),
      pct: pctChange(totalReceita, prevReceita),
      positiveIsGreen: true,
      color: 'text-blue-600 dark:text-blue-400',
      icon: TrendingUp,
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      tip: 'Soma de todas as receitas lançadas no mês selecionado.',
    },
    {
      label: 'Despesas Fixas',
      value: fmt(totalFixo),
      pct: pctChange(totalFixo, prevFixo),
      positiveIsGreen: false,
      color: 'text-orange-600 dark:text-orange-400',
      icon: AlertCircle,
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      tip: 'Custos recorrentes independentes do volume de vendas (aluguel, salários etc.).',
    },
    {
      label: 'Custos Variáveis',
      value: fmt(totalVariavel),
      pct: pctChange(totalVariavel, prevVariavel),
      positiveIsGreen: false,
      color: 'text-red-500 dark:text-red-400',
      icon: TrendingDown,
      bg: 'bg-red-50 dark:bg-red-950/30',
      tip: 'Custos que variam conforme o volume de vendas (estoque, comissões etc.).',
    },
    {
      label: 'Lucro / Margem',
      value: `${fmt(lucro)} (${margem}%)`,
      pct: pctChange(lucro, prevReceita - prevFixo - prevVariavel),
      positiveIsGreen: true,
      color: isNeg ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400',
      icon: DollarSign,
      bg: isNeg ? 'bg-red-50 dark:bg-red-950/30' : 'bg-green-50 dark:bg-green-950/30',
      tip: 'Resultado líquido: Receita − Custos Fixos − Custos Variáveis.',
      isNeg,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((k) => {
        const greenUp = k.positiveIsGreen ? (k.pct ?? 0) >= 0 : (k.pct ?? 0) <= 0
        return (
          <Card
            key={k.label}
            className={`border-0 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800 ${k.isNeg ? 'ring-2 ring-red-500 animate-pulse' : ''}`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center">
                  {k.label}
                  <InfoTooltip text={k.tip} />
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${k.bg}`}>
                  <k.icon className={`w-4 h-4 ${k.color}`} />
                </div>
              </div>
              <p className={`text-base font-bold leading-tight ${k.color}`}>{k.value}</p>
              {k.pct !== null && (
                <p className={`text-[11px] mt-1.5 font-medium ${greenUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {fmtPct(k.pct)} vs. mês anterior
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ─── DRE Chart ────────────────────────────────────────────────────────────────

function DREChart({ entries, currentMonth, darkMode }) {
  const [view, setView] = useState('barras')

  const tickColor = darkMode ? '#9ca3af' : '#6b7280'
  const gridColor = darkMode ? '#1f2937' : '#f3f4f6'

  // Bar chart data for current month
  const sum = (cat) => entries.filter((e) => e.month === currentMonth && e.category === cat).reduce((s, e) => s + e.value, 0)
  const totalReceita = sum('receita')
  const totalFixo = sum('custo_fixo')
  const totalVariavel = sum('custo_variavel')
  const lucro = totalReceita - totalFixo - totalVariavel

  const barData = [
    { name: 'Receita', value: totalReceita, fill: '#2563eb' },
    { name: 'Custos Fixos', value: totalFixo, fill: '#f97316' },
    { name: 'Custos Variáveis', value: totalVariavel, fill: '#ef4444' },
    { name: 'Lucro', value: Math.max(lucro, 0), fill: lucro >= 0 ? '#16a34a' : '#dc2626' },
  ]

  // Line chart — last 6 months
  const { year, month } = parseMonth(currentMonth)
  const lineData = Array.from({ length: 6 }, (_, i) => {
    let m = month - 5 + i
    let y = year
    while (m < 1) { m += 12; y-- }
    const ym = toYM(y, m)
    const rec = entries.filter((e) => e.month === ym && e.category === 'receita').reduce((s, e) => s + e.value, 0)
    const fix = entries.filter((e) => e.month === ym && e.category === 'custo_fixo').reduce((s, e) => s + e.value, 0)
    const varv = entries.filter((e) => e.month === ym && e.category === 'custo_variavel').reduce((s, e) => s + e.value, 0)
    return {
      name: MONTHS_PT[m - 1].slice(0, 3),
      Receita: rec,
      Custos: fix + varv,
      Resultado: rec - fix - varv,
    }
  })

  return (
    <Card className="border-0 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {view === 'barras' ? 'Comparativo DRE' : 'Evolução 6 Meses'}
          </CardTitle>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            <button
              onClick={() => setView('barras')}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md transition-colors font-medium ${view === 'barras' ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <BarChart2 className="w-3 h-3" /> Barras
            </button>
            <button
              onClick={() => setView('evolucao')}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md transition-colors font-medium ${view === 'evolucao' ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <LineChartIcon className="w-3 h-3" /> Evolução
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          {view === 'barras' ? (
            <BarChart data={barData} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: darkMode ? '#1f2937' : '#f9fafb' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          ) : (
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Receita" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Custos" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Resultado" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ─── DRE Table (structured) ───────────────────────────────────────────────────

function DRETable({ totalReceita, totalVariavel, totalFixo }) {
  const lucro_bruto = totalReceita - totalVariavel
  const ebitda = lucro_bruto - totalFixo
  const impostos = 0
  const resultado = ebitda - impostos
  const margem = totalReceita > 0 ? ((resultado / totalReceita) * 100).toFixed(1) : '0.0'

  const rows = [
    { label: '(+) Receita Bruta', value: totalReceita, indent: false, bold: false, color: 'text-blue-600 dark:text-blue-400' },
    { label: '(–) Custos Variáveis (CMV)', value: -totalVariavel, indent: true, bold: false, color: 'text-red-500 dark:text-red-400' },
    { label: '= LUCRO BRUTO', value: lucro_bruto, indent: false, bold: true, color: lucro_bruto >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400', highlight: true },
    { label: '(–) Despesas Operacionais Fixas', value: -totalFixo, indent: true, bold: false, color: 'text-orange-600 dark:text-orange-400' },
    { label: '= RESULTADO OPERACIONAL (EBITDA)', value: ebitda, indent: false, bold: true, color: ebitda >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400' },
    { label: '(–) Impostos / Deduções', value: -impostos, indent: true, bold: false, color: 'text-gray-500 dark:text-gray-400' },
    { label: '= RESULTADO LÍQUIDO', value: resultado, indent: false, bold: true, color: resultado >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400', highlight: true },
  ]

  return (
    <Card className="border-0 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">DRE Estruturado</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((row) => (
            <div
              key={row.label}
              className={`flex items-center justify-between py-2.5 ${row.indent ? 'pl-4' : ''} ${row.highlight ? 'bg-gray-50 dark:bg-gray-800/50 -mx-1 px-1 rounded-lg my-0.5' : ''}`}
            >
              <span className={`text-xs ${row.bold ? 'font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wide' : 'text-gray-600 dark:text-gray-400'}`}>
                {row.label}
              </span>
              <span className={`text-sm font-bold ${row.color}`}>
                {row.value >= 0 ? '' : ''}{fmt(row.value)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Margem Líquida</span>
          <span className={`text-sm font-bold ${Number(margem) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {margem}%
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Section editable ─────────────────────────────────────────────────────────

function DRESection({ title, icon: Icon, iconColor, sign, items, onUpdate, onDelete, onAdd, groupBy }) {
  const [editingId, setEditingId] = useState(null)
  const [editBuf, setEditBuf] = useState({ label: '', value: '', grupo: '' })
  const [addMode, setAddMode] = useState(false)
  const [addBuf, setAddBuf] = useState({ label: '', value: '', grupo: '' })

  const total = items.reduce((s, i) => s + i.value, 0)

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditBuf({ label: item.label, value: String(item.value), grupo: item.grupo || '' })
  }
  const saveEdit = (id) => {
    if (!editBuf.label.trim() || !editBuf.value) return
    onUpdate(id, { label: editBuf.label.trim(), value: parseFloat(editBuf.value), grupo: editBuf.grupo })
    setEditingId(null)
  }
  const saveAdd = () => {
    if (!addBuf.label.trim() || !addBuf.value) return
    onAdd({ label: addBuf.label.trim(), value: parseFloat(addBuf.value), grupo: addBuf.grupo })
    setAddBuf({ label: '', value: '', grupo: '' })
    setAddMode(false)
  }

  const renderItem = (item) => {
    if (editingId === item.id) {
      return (
        <div key={item.id} className="flex items-center gap-2 py-2 px-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <Input value={editBuf.label} onChange={(e) => setEditBuf((b) => ({ ...b, label: e.target.value }))}
            className="flex-1 h-7 text-xs dark:bg-gray-800 dark:border-gray-700" autoFocus />
          <Input value={editBuf.grupo} onChange={(e) => setEditBuf((b) => ({ ...b, grupo: e.target.value }))}
            placeholder="Grupo" className="w-24 h-7 text-xs dark:bg-gray-800 dark:border-gray-700" />
          <Input type="number" value={editBuf.value} onChange={(e) => setEditBuf((b) => ({ ...b, value: e.target.value }))}
            className="w-28 h-7 text-xs dark:bg-gray-800 dark:border-gray-700"
            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(item.id); if (e.key === 'Escape') setEditingId(null) }} />
          <button onClick={() => saveEdit(item.id)} className="p-1 rounded text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => setEditingId(null)} className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X className="w-3.5 h-3.5" /></button>
        </div>
      )
    }
    return (
      <div key={item.id} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition-colors">
        <div className="flex-1 min-w-0">
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate block">{item.label}</span>
          {item.grupo && <span className="text-[11px] text-gray-400 dark:text-gray-500">{item.grupo}</span>}
        </div>
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          <span className={`text-sm font-semibold ${sign === '+' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {sign}{fmt(item.value)}
          </span>
          <button onClick={() => startEdit(item)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all"><Pencil className="w-3 h-3" /></button>
          <button onClick={() => onDelete(item.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all"><Trash2 className="w-3 h-3" /></button>
        </div>
      </div>
    )
  }

  const renderGrouped = () => {
    const groups = {}
    items.forEach((item) => {
      const g = item.grupo || 'Sem categoria'
      if (!groups[g]) groups[g] = []
      groups[g].push(item)
    })
    return Object.entries(groups).map(([g, gItems]) => (
      <div key={g} className="mb-2">
        <div className="flex items-center justify-between px-2 py-1 mb-0.5">
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{g}</span>
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{fmt(gItems.reduce((s, i) => s + i.value, 0))}</span>
        </div>
        {gItems.map(renderItem)}
      </div>
    ))
  }

  return (
    <Card className="border-0 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Icon className={`w-4 h-4 ${iconColor}`} />
            {title}
          </CardTitle>
          <span className={`text-sm font-bold ${sign === '+' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {sign}{fmt(total)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-0.5">
          {groupBy ? renderGrouped() : items.map(renderItem)}
        </div>

        {addMode ? (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t dark:border-gray-800 flex-wrap">
            <Input placeholder="Descrição" value={addBuf.label}
              onChange={(e) => setAddBuf((b) => ({ ...b, label: e.target.value }))}
              className="flex-1 h-8 text-xs dark:bg-gray-800 dark:border-gray-700 min-w-32"
              autoFocus onKeyDown={(e) => { if (e.key === 'Enter') saveAdd(); if (e.key === 'Escape') setAddMode(false) }} />
            <Input placeholder="Grupo" value={addBuf.grupo}
              onChange={(e) => setAddBuf((b) => ({ ...b, grupo: e.target.value }))}
              className="w-24 h-8 text-xs dark:bg-gray-800 dark:border-gray-700" />
            <Input type="number" placeholder="Valor" value={addBuf.value}
              onChange={(e) => setAddBuf((b) => ({ ...b, value: e.target.value }))}
              className="w-28 h-8 text-xs dark:bg-gray-800 dark:border-gray-700"
              onKeyDown={(e) => { if (e.key === 'Enter') saveAdd(); if (e.key === 'Escape') setAddMode(false) }} />
            <button onClick={saveAdd} className="p-1.5 rounded text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"><Check className="w-3.5 h-3.5" /></button>
            <button onClick={() => setAddMode(false)} className="p-1.5 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <button onClick={() => setAddMode(true)}
            className="mt-2 w-full flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 py-2 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-dashed border-gray-200 dark:border-gray-700">
            <Plus className="w-3.5 h-3.5" />
            Adicionar item
          </button>
        )}

        <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total</span>
          <span className={`text-sm font-bold ${sign === '+' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {sign}{fmt(total)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Export CSV ───────────────────────────────────────────────────────────────

function exportCSV(entries, month) {
  const rows = [['ID','Descrição','Categoria','Grupo','Valor','Mês']]
  entries.filter((e) => e.month === month).forEach((e) => {
    rows.push([e.id, e.label, e.category, e.grupo || '', e.value, e.month])
  })
  const csv = rows.map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `DRE_${month}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Financial() {
  const { darkMode } = useApp()
  const [currentMonth, setCurrentMonth] = useState('2026-04')
  const [entries, setEntries] = useState(INITIAL_ENTRIES)
  const [groupBy, setGroupBy] = useState(false)

  const forMonth = (cat) => entries.filter((e) => e.month === currentMonth && e.category === cat)
  const forPrev = (cat) => entries.filter((e) => e.month === prevYM(currentMonth) && e.category === cat)

  const receita = forMonth('receita')
  const custoFixo = forMonth('custo_fixo')
  const custoVariavel = forMonth('custo_variavel')

  const prevReceita = forPrev('receita').reduce((s, i) => s + i.value, 0)
  const prevFixo = forPrev('custo_fixo').reduce((s, i) => s + i.value, 0)
  const prevVariavel = forPrev('custo_variavel').reduce((s, i) => s + i.value, 0)

  const totalReceita = receita.reduce((s, i) => s + i.value, 0)
  const totalFixo = custoFixo.reduce((s, i) => s + i.value, 0)
  const totalVariavel = custoVariavel.reduce((s, i) => s + i.value, 0)
  const lucro = totalReceita - totalFixo - totalVariavel
  const isNeg = lucro < 0

  const handleUpdate = (id, updates) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))

  const handleDelete = (id) =>
    setEntries((prev) => prev.filter((e) => e.id !== id))

  const handleAdd = (category) => (item) =>
    setEntries((prev) => [
      ...prev,
      { id: `item-${Date.now()}`, month: currentMonth, category, grupo: '', ...item },
    ])

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Financeiro</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            DRE — Demonstrativo de Resultado do Exercício
            <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">Editável</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <MonthSelector value={currentMonth} onChange={setCurrentMonth} />
          <button
            onClick={() => exportCSV(entries, currentMonth)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <DRESummaryCards
        receita={receita}
        custoFixo={custoFixo}
        custoVariavel={custoVariavel}
        prevReceita={prevReceita}
        prevFixo={prevFixo}
        prevVariavel={prevVariavel}
      />

      {/* Chart */}
      <DREChart entries={entries} currentMonth={currentMonth} darkMode={darkMode} />

      {/* DRE Table */}
      <DRETable totalReceita={totalReceita} totalVariavel={totalVariavel} totalFixo={totalFixo} />

      {/* Agrupamento toggle (receita) */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Receitas:</span>
        <button
          onClick={() => setGroupBy((v) => !v)}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${groupBy ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
        >
          {groupBy ? <Tag className="w-3 h-3" /> : <List className="w-3 h-3" />}
          {groupBy ? 'Agrupado por categoria' : 'Agrupar por categoria'}
        </button>
      </div>

      {/* DRE Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DRESection
          title="Receita"
          icon={TrendingUp}
          iconColor="text-green-500"
          sign="+"
          items={receita}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onAdd={handleAdd('receita')}
          groupBy={groupBy}
        />
        <div className="space-y-6">
          <DRESection
            title="Custos Fixos"
            icon={AlertCircle}
            iconColor="text-orange-500"
            sign="-"
            items={custoFixo}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onAdd={handleAdd('custo_fixo')}
            groupBy={false}
          />
          <DRESection
            title="Custos Variáveis"
            icon={TrendingDown}
            iconColor="text-red-500"
            sign="-"
            items={custoVariavel}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onAdd={handleAdd('custo_variavel')}
            groupBy={false}
          />
        </div>
      </div>

      {/* Resultado Final */}
      <Card className={`border-0 shadow-sm bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white ${isNeg ? 'ring-2 ring-red-500' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Resultado do período — {labelYM(currentMonth)}</p>
              <p className={`text-3xl font-bold ${isNeg ? 'text-red-400' : 'text-green-400'}`}>
                {lucro >= 0 ? '+' : ''}{fmt(lucro)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Margem: <span className={`font-semibold ${isNeg ? 'text-red-400' : 'text-green-400'}`}>
                  {totalReceita > 0 ? ((lucro / totalReceita) * 100).toFixed(1) : '0.0'}%
                </span>
              </p>
            </div>
            <div className="text-right space-y-1.5 text-sm">
              <p className="text-gray-400">Receita: <span className="text-blue-400 font-semibold">{fmt(totalReceita)}</span></p>
              <p className="text-gray-400">Lucro Bruto: <span className="text-emerald-400 font-semibold">{fmt(totalReceita - totalVariavel)}</span></p>
              <p className="text-gray-400">Custos Fixos: <span className="text-orange-400 font-semibold">-{fmt(totalFixo)}</span></p>
              <p className="text-gray-400">Custos Variáveis: <span className="text-red-400 font-semibold">-{fmt(totalVariavel)}</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
