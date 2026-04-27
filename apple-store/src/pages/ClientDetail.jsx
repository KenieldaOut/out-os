import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, ShoppingBag, DollarSign, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/context/AppContext'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
const tv = (s) => s.totalValue ?? s.value ?? s.payments?.reduce((a, p) => a + (parseFloat(p.value) || 0), 0) ?? 0

export default function ClientDetail() {
  const { id } = useParams()
  const { clients, sales } = useApp()

  const client = clients.find((c) => c.id === id)

  if (!client) {
    return (
      <div className="p-6">
        <Link to="/clientes">
          <Button variant="outline" size="sm" className="gap-2 mb-6 dark:border-gray-700 dark:text-gray-300">
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </Button>
        </Link>
        <p className="text-gray-500 dark:text-gray-400">Cliente não encontrado.</p>
      </div>
    )
  }

  const clientSales = sales
    .filter((s) => s.clientName.toLowerCase() === client.name.toLowerCase())
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const totalSpent = clientSales.reduce((acc, s) => acc + tv(s), 0)
  const totalPaid = clientSales.filter((s) => s.status === 'pago').reduce((acc, s) => acc + tv(s), 0)

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <Link to="/clientes">
        <Button variant="outline" size="sm" className="gap-2 dark:border-gray-700 dark:text-gray-300">
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para Clientes
        </Button>
      </Link>

      {/* Client header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{client.name.charAt(0)}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{client.name}</h1>
          <div className="flex flex-wrap gap-3 mt-1">
            {client.phone && (
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> {client.phone}
              </span>
            )}
            {client.email && (
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {client.email}
              </span>
            )}
            {client.cpf && (
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{client.cpf}</span>
            )}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Cliente desde {fmtDate(client.date)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Compras</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{clientSales.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Pago</p>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{fmt(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Gasto</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{fmt(totalSpent)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Purchase history */}
      <Card className="border-0 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">Histórico de Compras</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {clientSales.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
              Nenhuma compra registrada
            </div>
          ) : (
            <div>
              {clientSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-800 last:border-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{sale.product}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{fmtDate(sale.date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={sale.status === 'pago' ? 'success' : 'warning'}>
                      {sale.status === 'pago' ? 'Pago' : 'Pendente'}
                    </Badge>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{fmt(tv(sale))}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
