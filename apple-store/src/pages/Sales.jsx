import { useState, useMemo } from 'react'
import { Plus, Search, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import { collection, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')

const PAYMENT_TYPES = ['PIX', 'Dinheiro', 'Cartão Crédito', 'Cartão Débito', 'Boleto']
const PAGE_SIZE = 10

const emptyPayment = () => ({ id: Date.now(), type: 'PIX', value: '' })

const emptyForm = () => ({
  clientName: '',
  inventoryItemId: '',
  product: '',
  payments: [emptyPayment()],
  status: 'pendente',
})

function formatPayments(sale) {
  if (sale.payments?.length) {
    return sale.payments.map((p) => `${p.type} ${fmt(p.value)}`).join(' + ')
  }
  return sale.paymentMethod ?? '—'
}

function Pagination({ page, total, onChange }) {
  const pages = Math.ceil(total / PAGE_SIZE)
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-800">
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} de {total}
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg border dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === pages}
          className="p-1.5 rounded-lg border dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  )
}

export default function Sales() {
  const { sales, addSale, setSales, inventory, updateInventoryItem } = useApp()
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [form, setForm] = useState(emptyForm())

  const availableItems = useMemo(
    () => inventory.filter((i) => i.status === 'disponível'),
    [inventory],
  )

  const totalValue = (s) =>
    s.totalValue ?? s.value ?? s.payments?.reduce((acc, p) => acc + (parseFloat(p.value) || 0), 0) ?? 0

  const filtered = useMemo(
    () =>
      sales.filter(
        (s) =>
          s.clientName.toLowerCase().includes(search.toLowerCase()) ||
          (s.product ?? '').toLowerCase().includes(search.toLowerCase()),
      ),
    [sales, search],
  )

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPago = sales.filter((s) => s.status === 'pago').reduce((acc, s) => acc + totalValue(s), 0)
  const totalPendente = sales.filter((s) => s.status === 'pendente').reduce((acc, s) => acc + totalValue(s), 0)
  const formTotal = form.payments.reduce((acc, p) => acc + (parseFloat(p.value) || 0), 0)

  const addPayment = () =>
    setForm((f) => ({ ...f, payments: [...f.payments, { ...emptyPayment(), id: Date.now() }] }))

  const removePayment = (id) =>
    setForm((f) => ({ ...f, payments: f.payments.filter((p) => p.id !== id) }))

  const updatePayment = (id, field, val) =>
    setForm((f) => ({
      ...f,
      payments: f.payments.map((p) => (p.id === id ? { ...p, [field]: val } : p)),
    }))

  const handleSelectInventoryItem = (itemId) => {
    const item = availableItems.find((i) => i.id === itemId)
    if (!item) return
    setForm((f) => ({
      ...f,
      inventoryItemId: item.id,
      product: item.name,
      payments: [{ ...emptyPayment(), value: String(item.price) }],
    }))
  }

  const handleSave = async () => {
    if (!form.clientName.trim() || !form.product || formTotal <= 0) return
    if (form.inventoryItemId) {
      updateInventoryItem(form.inventoryItemId, { status: 'vendido' })
    }
    let vendaId = null
    try {
      const vendaRef = await addDoc(collection(db, 'vendas'), {
        clienteNome: form.clientName.trim(),
        produto: form.product,
        valor: formTotal,
        status: form.status,
        criadoEm: Timestamp.now(),
      })
      vendaId = vendaRef.id
      await addDoc(collection(db, 'financeiro'), {
        label: `${form.clientName.trim()} — ${form.product}`,
        valor: formTotal,
        month: new Date().toISOString().slice(0, 7),
        category: 'receita',
        grupo: '',
        criadoEm: Timestamp.now(),
        vendaId,
      })
    } catch (err) {
      console.error('[Firebase] Erro ao registrar venda:', err)
    }
    addSale({
      id: String(Date.now()),
      vendaId,
      clientName: form.clientName.trim(),
      product: form.product,
      totalValue: formTotal,
      payments: form.payments.map((p) => ({ type: p.type, value: parseFloat(p.value) || 0 })),
      status: form.status,
      date: new Date().toISOString().split('T')[0],
    })
    addToast('Venda registrada com sucesso!')
    setForm(emptyForm())
    setDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!confirmDeleteId) return
    const sale = sales.find((s) => s.id === confirmDeleteId)
    try {
      if (sale?.vendaId) {
        await deleteDoc(doc(db, 'vendas', sale.vendaId))
      }
    } catch (err) {
      console.error('[Firebase] Erro ao remover venda:', err)
    }
    setSales((prev) => prev.filter((s) => s.id !== confirmDeleteId))
    setConfirmDeleteId(null)
    addToast('Venda removida.')
  }

  const openDialog = () => {
    setForm(emptyForm())
    setDialogOpen(true)
  }

  const handleSearch = (v) => {
    setSearch(v)
    setPage(1)
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Vendas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{sales.length} vendas registradas</p>
        </div>
        <Button onClick={openDialog} className="flex-shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Nova Venda
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total Recebido</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{fmt(totalPago)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">A Receber</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{fmt(totalPendente)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar por cliente ou produto..."
          className="pl-9"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/60 dark:bg-gray-800/40">
                  <TableHead className="dark:text-gray-400">Cliente</TableHead>
                  <TableHead className="dark:text-gray-400">Produto</TableHead>
                  <TableHead className="dark:text-gray-400">Total</TableHead>
                  <TableHead className="dark:text-gray-400">Pagamentos</TableHead>
                  <TableHead className="dark:text-gray-400">Status</TableHead>
                  <TableHead className="dark:text-gray-400">Data</TableHead>
                  <TableHead className="w-12 dark:text-gray-400" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-400 py-10">
                      Nenhuma venda encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((sale) => (
                    <TableRow key={sale.id} className="dark:border-gray-800 dark:hover:bg-gray-800/40">
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">{sale.clientName}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400 text-sm">{sale.product}</TableCell>
                      <TableCell className="font-bold text-gray-900 dark:text-gray-100">{fmt(totalValue(sale))}</TableCell>
                      <TableCell className="text-gray-500 dark:text-gray-400 text-xs max-w-[180px]">
                        {formatPayments(sale)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sale.status === 'pago' ? 'success' : 'warning'}>
                          {sale.status === 'pago' ? 'Pago' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500 dark:text-gray-400 text-sm">{fmtDate(sale.date)}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => setConfirmDeleteId(sale.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <Pagination page={page} total={filtered.length} onChange={setPage} />
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Nova Venda</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Cliente */}
            <div className="space-y-1.5">
              <Label className="dark:text-gray-300">Cliente *</Label>
              <Input
                placeholder="Nome do cliente"
                value={form.clientName}
                onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                className="dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            {/* Produto do estoque */}
            <div className="space-y-1.5">
              <Label className="dark:text-gray-300">Produto (Estoque) *</Label>
              {availableItems.length === 0 ? (
                <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                  Nenhum produto disponível no estoque. Cadastre um item primeiro.
                </p>
              ) : (
                <Select value={form.inventoryItemId} onValueChange={handleSelectInventoryItem}>
                  <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectValue placeholder="Selecione do estoque..." />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-800 max-h-56">
                    {availableItems.map((item) => (
                      <SelectItem key={item.id} value={item.id} className="dark:text-gray-200 dark:focus:bg-gray-800">
                        <span className="font-medium">{item.name}</span>
                        <span className="ml-2 text-gray-400 text-xs font-mono">#{item.code.slice(-6)}</span>
                        <span className="ml-2 text-green-600 dark:text-green-400 text-xs font-bold">{fmt(item.price)}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Pagamentos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="dark:text-gray-300">Formas de pagamento *</Label>
                <button
                  type="button"
                  onClick={addPayment}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Adicionar
                </button>
              </div>

              <div className="space-y-2">
                {form.payments.map((p) => (
                  <div key={p.id} className="flex gap-2 items-center">
                    <Select value={p.type} onValueChange={(v) => updatePayment(p.id, 'type', v)}>
                      <SelectTrigger className="w-40 dark:bg-gray-800 dark:border-gray-700 flex-shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                        {PAYMENT_TYPES.map((t) => (
                          <SelectItem key={t} value={t} className="dark:text-gray-200 dark:focus:bg-gray-800">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={p.value}
                      onChange={(e) => updatePayment(p.id, 'value', e.target.value)}
                      className="flex-1 dark:bg-gray-800 dark:border-gray-700"
                    />
                    {form.payments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePayment(p.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">Total da venda</span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{fmt(formTotal)}</span>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="dark:text-gray-300">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                  <SelectItem value="pago" className="dark:text-gray-200 dark:focus:bg-gray-800">Pago</SelectItem>
                  <SelectItem value="pendente" className="dark:text-gray-200 dark:focus:bg-gray-800">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="dark:border-gray-700 dark:text-gray-300">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.clientName.trim() || !form.product || formTotal <= 0}
            >
              Salvar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(v) => !v && setConfirmDeleteId(null)}>
        <DialogContent className="sm:max-w-xs dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100 text-red-600 dark:text-red-400">
              Confirmar exclusão
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tem certeza que deseja remover esta venda? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteId(null)}
              className="dark:border-gray-700 dark:text-gray-300"
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
