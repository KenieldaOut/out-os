import { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Phone, Mail, Trash2, ChevronLeft, ChevronRight, ExternalLink, FlaskConical } from 'lucide-react'
import { Link } from 'react-router-dom'
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'

const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
const PAGE_SIZE = 10

const maskCPF = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }
  return d
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
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

export default function Clients() {
  useApp() // mantém o contexto ativo para outros módulos
  const { addToast } = useToast()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', cpf: '' })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const q = query(collection(db, 'clientes'), orderBy('criadoEm', 'desc'))
        const snap = await getDocs(q)
        const data = snap.docs.map((d) => {
          const raw = d.data()
          return {
            id: d.id,
            name: raw.name || raw.nome || '',
            phone: raw.phone || raw.telefone || '',
            email: raw.email || '',
            cpf: raw.cpf || '',
            date: raw.criadoEm?.toDate().toISOString().split('T')[0] ?? '',
          }
        })
        setClients(data)
      } catch (err) {
        console.error('[Firebase] Erro ao carregar clientes:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(
    () =>
      clients.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search),
      ),
    [clients, search],
  )

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSave = async () => {
    if (!form.name.trim()) return
    try {
      const docRef = await addDoc(collection(db, 'clientes'), {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        cpf: form.cpf.trim(),
        criadoEm: Timestamp.now(),
      })
      setClients((prev) => [{
        id: docRef.id,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        cpf: form.cpf.trim(),
        date: new Date().toISOString().split('T')[0],
      }, ...prev])
      addToast('Cliente cadastrado com sucesso!')
      setForm({ name: '', phone: '', email: '', cpf: '' })
      setDialogOpen(false)
    } catch (err) {
      console.error('[Firebase] Erro ao salvar cliente:', err)
      addToast(`Erro ao salvar: ${err.message}`)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'clientes', id))
      setClients((prev) => prev.filter((c) => c.id !== id))
      setConfirmDeleteId(null)
      addToast('Cliente removido.')
    } catch (err) {
      console.error('[Firebase] Erro ao remover cliente:', err)
      addToast(`Erro ao remover: ${err.message}`)
    }
  }

  const handleSearch = (v) => {
    setSearch(v)
    setPage(1)
  }

  const openDialog = () => {
    setForm({ name: '', phone: '', email: '', cpf: '' })
    setDialogOpen(true)
  }

  const testarFirebase = async () => {
    console.log('[Firebase] Iniciando teste de escrita no Firestore...')
    console.log('[Firebase] db:', db)
    try {
      const docRef = await addDoc(collection(db, 'clientes'), {
        nome: 'Cliente Teste',
        telefone: '999999999',
        criadoEm: Timestamp.now(),
      })
      console.log('[Firebase] Documento salvo com ID:', docRef.id)
      addToast('Firebase OK — cliente salvo no Firestore!')
    } catch (err) {
      console.error('[Firebase] Erro ao salvar:', err.code, err.message, err)
      addToast(`Erro Firebase: ${err.code ?? ''} — ${err.message}`)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Clientes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {clients.length} clientes cadastrados
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" onClick={testarFirebase} className="dark:border-gray-700 dark:text-gray-300">
            <FlaskConical className="w-4 h-4 mr-2" />
            Testar Firebase
          </Button>
          <Button onClick={openDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome, email ou telefone..."
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
                <TableRow className="bg-gray-50/50 dark:bg-gray-800/40">
                  <TableHead className="dark:text-gray-400">Cliente</TableHead>
                  <TableHead className="dark:text-gray-400">Telefone</TableHead>
                  <TableHead className="dark:text-gray-400">Email</TableHead>
                  <TableHead className="dark:text-gray-400">CPF/CNPJ</TableHead>
                  <TableHead className="dark:text-gray-400">Cadastro</TableHead>
                  <TableHead className="w-20 dark:text-gray-400" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400 py-10">
                      Carregando clientes...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-red-400 py-10">
                      Erro ao carregar dados: {error}
                    </TableCell>
                  </TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400 py-10">
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((client) => (
                    <TableRow key={client.id} className="dark:border-gray-800 dark:hover:bg-gray-800/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {client.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{client.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                          <Phone className="w-3.5 h-3.5" />
                          <span className="text-sm">{client.phone || '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="text-sm">{client.email || '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {client.cpf || '—'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                        {fmtDate(client.date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Link to={`/clientes/${client.id}`}>
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => setConfirmDeleteId(client.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

      {/* Add Client Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Nome completo *</Label>
              <Input
                placeholder="Ex: João Silva"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">CPF / CNPJ</Label>
              <Input
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(e) => setForm((p) => ({ ...p, cpf: maskCPF(e.target.value) }))}
                className="dark:bg-gray-800 dark:border-gray-700 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Telefone</Label>
              <Input
                placeholder="Ex: (11) 99999-9999"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Email</Label>
              <Input
                type="email"
                placeholder="Ex: joao@email.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="dark:border-gray-700 dark:text-gray-300">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(v) => !v && setConfirmDeleteId(null)}>
        <DialogContent className="sm:max-w-xs dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100 text-red-600 dark:text-red-400">Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)} className="dark:border-gray-700 dark:text-gray-300">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(confirmDeleteId)}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
