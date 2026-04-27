import { useState, useMemo } from 'react'
import { Plus, Search, Package, Tag, Hash, DollarSign, Pencil, Check, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
import { useProducts } from '@/context/ProductsContext'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const STATUS_FILTER = ['Todos', 'disponível', 'vendido']
const PAGE_SIZE = 10

const emptyForm = { category: '', name: '', code: '', price: '', status: 'disponível' }

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

export default function Inventory() {
  const { inventory, addInventoryItem, updateInventoryItem } = useApp()
  const { addToast } = useToast()
  const { products } = useProducts()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [editStatus, setEditStatus] = useState('')

  const productOptions = form.category
    ? products.filter((p) => p.categoria === form.category).map((p) => p.nome)
    : []
  const categories = [...new Set(products.map((p) => p.categoria))].sort()

  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'Todos' || item.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [inventory, search, statusFilter])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleFilterChange = (f) => { setStatusFilter(f); setPage(1) }
  const handleSearch = (v) => { setSearch(v); setPage(1) }

  const stats = {
    total: inventory.length,
    disponivel: inventory.filter((i) => i.status === 'disponível').length,
    vendido: inventory.filter((i) => i.status === 'vendido').length,
    valorEstoque: inventory.filter((i) => i.status === 'disponível').reduce((s, i) => s + i.price, 0),
  }

  const handleSave = () => {
    if (!form.name || !form.code || !form.price) return
    addInventoryItem({
      id: `inv${Date.now()}`,
      name: form.name,
      category: form.category,
      code: form.code.trim(),
      price: parseFloat(form.price),
      status: form.status,
    })
    addToast('Produto cadastrado no estoque!')
    setForm(emptyForm)
    setDialogOpen(false)
  }

  const openDialog = () => {
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const startEditStatus = (item) => {
    setEditingId(item.id)
    setEditStatus(item.status)
  }

  const saveEditStatus = (id) => {
    updateInventoryItem(id, { status: editStatus })
    setEditingId(null)
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Estoque</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {stats.total} produtos cadastrados
          </p>
        </div>
        <Button onClick={openDialog} className="flex-shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total de Produtos', value: stats.total, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
          { label: 'Disponíveis', value: stats.disponivel, icon: Check, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
          { label: 'Vendidos', value: stats.vendido, icon: Tag, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800' },
          { label: 'Valor em Estoque', value: fmt(stats.valorEstoque), icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950', wide: true },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg}`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${s.wide ? s.color : 'text-gray-900 dark:text-gray-100'}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou código IMEI..."
            className="pl-9"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg self-start sm:self-auto">
          {STATUS_FILTER.map((s) => (
            <button
              key={s}
              onClick={() => handleFilterChange(s)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                statusFilter === s
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/60 dark:bg-gray-800/40">
                <TableHead className="dark:text-gray-400">Produto</TableHead>
                <TableHead className="dark:text-gray-400">Categoria</TableHead>
                <TableHead className="dark:text-gray-400">IMEI / Código</TableHead>
                <TableHead className="dark:text-gray-400">Preço</TableHead>
                <TableHead className="dark:text-gray-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400 py-12">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Nenhum produto encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((item) => (
                  <TableRow
                    key={item.id}
                    className={`dark:border-gray-800 dark:hover:bg-gray-800/40 transition-opacity ${item.status === 'vendido' ? 'opacity-50' : ''}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="dark:border-gray-700 dark:text-gray-400">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {item.code}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-gray-900 dark:text-gray-100">
                      {fmt(item.price)}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="text-xs border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <option value="disponível">Disponível</option>
                            <option value="vendido">Vendido</option>
                          </select>
                          <button
                            onClick={() => saveEditStatus(item.id)}
                            className="p-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditStatus(item)}
                          className="flex items-center gap-1.5 group"
                        >
                          <Badge
                            variant={item.status === 'disponível' ? 'success' : 'secondary'}
                            className={item.status === 'vendido' ? 'dark:bg-gray-800 dark:text-gray-400' : ''}
                          >
                            {item.status === 'disponível' ? 'Disponível' : 'Vendido'}
                          </Badge>
                          <Pencil className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" />
                        </button>
                      )}
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
        <DialogContent className="sm:max-w-sm dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Novo Produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Categoria *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v, name: '' }))}
              >
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                  {categories.map((c) => (
                    <SelectItem key={c} value={c} className="dark:text-gray-200 dark:focus:bg-gray-800">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="dark:text-gray-300">Produto *</Label>
              <Select
                value={form.name}
                onValueChange={(v) => setForm((p) => ({ ...p, name: v }))}
                disabled={!form.category}
              >
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectValue placeholder={form.category ? 'Selecione...' : 'Escolha uma categoria'} />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                  {productOptions.map((p) => (
                    <SelectItem key={p} value={p} className="dark:text-gray-200 dark:focus:bg-gray-800">{p}</SelectItem>
                  ))}
                  <SelectItem value="__custom__" className="dark:text-gray-200 dark:focus:bg-gray-800 text-blue-600 dark:text-blue-400">
                    + Outro (digitar)
                  </SelectItem>
                </SelectContent>
              </Select>
              {form.name === '__custom__' && (
                <Input
                  placeholder="Nome do produto"
                  className="dark:bg-gray-800 dark:border-gray-700"
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value || '__custom__' }))}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="dark:text-gray-300">IMEI / Código de Série *</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  placeholder="Ex: 354901234567890"
                  className="pl-8 font-mono dark:bg-gray-800 dark:border-gray-700"
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="dark:text-gray-300">Preço (R$) *</Label>
              <Input
                type="number"
                placeholder="0.00"
                className="dark:bg-gray-800 dark:border-gray-700"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="dark:text-gray-300">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                  <SelectItem value="disponível" className="dark:text-gray-200 dark:focus:bg-gray-800">Disponível</SelectItem>
                  <SelectItem value="vendido" className="dark:text-gray-200 dark:focus:bg-gray-800">Vendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="dark:border-gray-700 dark:text-gray-300">
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
