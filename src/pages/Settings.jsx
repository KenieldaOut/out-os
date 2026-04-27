import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useProducts } from '@/context/ProductsContext'
import { useToast } from '@/context/ToastContext'
import { PRODUCT_CATEGORIES } from '@/data/products'

const CATEGORIAS = Object.keys(PRODUCT_CATEGORIES)
const emptyForm = { nome: '', categoria: '' }

export default function Settings() {
  const { products, setProducts } = useProducts()
  const { addToast } = useToast()

  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const firestoreProducts = products.filter((p) => !p.isDefault)
  const hasOnlyDefaults = products.length > 0 && firestoreProducts.length === 0

  const filtered = useMemo(
    () =>
      firestoreProducts.filter(
        (p) =>
          p.nome.toLowerCase().includes(search.toLowerCase()) ||
          p.categoria.toLowerCase().includes(search.toLowerCase()),
      ),
    [firestoreProducts, search],
  )

  const openAdd = () => {
    setEditingProduct(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setForm({ nome: product.nome, categoria: product.categoria })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.nome.trim() || !form.categoria) return
    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'produtos', editingProduct.id), {
          nome: form.nome.trim(),
          categoria: form.categoria,
        })
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? { ...p, nome: form.nome.trim(), categoria: form.categoria }
              : p,
          ),
        )
        addToast('Produto atualizado!')
      } else {
        const docRef = await addDoc(collection(db, 'produtos'), {
          nome: form.nome.trim(),
          categoria: form.categoria,
          criadoEm: Timestamp.now(),
        })
        setProducts((prev) => [
          ...prev.filter((p) => !p.isDefault),
          { id: docRef.id, nome: form.nome.trim(), categoria: form.categoria },
        ])
        addToast('Produto adicionado!')
      }
      setDialogOpen(false)
      setEditingProduct(null)
    } catch (err) {
      console.error('[Firebase] Erro ao salvar produto:', err)
      addToast(`Erro: ${err.message}`)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'produtos', id))
      setProducts((prev) => prev.filter((p) => p.id !== id))
      setConfirmDeleteId(null)
      addToast('Produto removido.')
    } catch (err) {
      console.error('[Firebase] Erro ao remover produto:', err)
      addToast(`Erro: ${err.message}`)
    }
  }

  const handlePublishDefaults = async () => {
    try {
      const batch = CATEGORIAS.flatMap((categoria) =>
        (PRODUCT_CATEGORIES[categoria] ?? []).map((nome) =>
          addDoc(collection(db, 'produtos'), { nome, categoria, criadoEm: Timestamp.now() }),
        ),
      )
      const refs = await Promise.all(batch)
      const inserted = refs.map((r, i) => {
        const allNames = CATEGORIAS.flatMap((c) => PRODUCT_CATEGORIES[c].map((n) => ({ nome: n, categoria: c })))
        return { id: r.id, ...allNames[i] }
      })
      setProducts(inserted)
      addToast('Produtos padrão publicados no Firebase!')
    } catch (err) {
      console.error('[Firebase] Erro ao publicar padrões:', err)
      addToast(`Erro: ${err.message}`)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Configurações</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Gerencie produtos e preferências do sistema
        </p>
      </div>

      {/* Produtos section */}
      <Card className="border-0 shadow-sm dark:bg-gray-900 dark:border dark:border-gray-800">
        <CardHeader className="pb-3 border-b dark:border-gray-800">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-base dark:text-gray-100">Produtos</CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {firestoreProducts.length} produtos no Firebase
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  placeholder="Buscar..."
                  className="pl-8 h-8 text-sm w-40 dark:bg-gray-800 dark:border-gray-700"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button size="sm" onClick={openAdd} className="h-8 flex-shrink-0">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Novo Produto
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Banner when only using static fallback */}
          {hasOnlyDefaults && (
            <div className="mx-4 mt-4 mb-2 flex items-center justify-between gap-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Os selects usam a lista padrão. Publique os produtos no Firebase para gerenciá-los aqui.
              </p>
              <Button size="sm" variant="outline" onClick={handlePublishDefaults} className="flex-shrink-0 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 h-8">
                Publicar padrões
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-gray-800/40">
                  <TableHead className="dark:text-gray-400">Nome</TableHead>
                  <TableHead className="dark:text-gray-400">Categoria</TableHead>
                  <TableHead className="w-20 dark:text-gray-400" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-400 py-10">
                      {firestoreProducts.length === 0
                        ? 'Nenhum produto no Firebase. Clique em "Novo Produto" ou "Publicar padrões".'
                        : 'Nenhum produto encontrado'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((product) => (
                    <TableRow key={product.id} className="dark:border-gray-800 dark:hover:bg-gray-800/40">
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        {product.nome}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs dark:border-gray-700 dark:text-gray-400">
                          {product.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(product.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xs dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="dark:text-gray-300">Nome *</Label>
              <Input
                placeholder="Ex: iPhone 15 Pro"
                value={form.nome}
                onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                className="dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="dark:text-gray-300">Categoria *</Label>
              <Select value={form.categoria} onValueChange={(v) => setForm((p) => ({ ...p, categoria: v }))}>
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c} value={c} className="dark:text-gray-200 dark:focus:bg-gray-800">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="dark:border-gray-700 dark:text-gray-300"
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!form.nome.trim() || !form.categoria}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(v) => !v && setConfirmDeleteId(null)}>
        <DialogContent className="sm:max-w-xs dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100 text-red-600 dark:text-red-400">
              Confirmar exclusão
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tem certeza que deseja remover este produto? Os registros existentes não serão afetados.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteId(null)}
              className="dark:border-gray-700 dark:text-gray-300"
            >
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
