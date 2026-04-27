import { useState, useMemo, useEffect } from 'react'
import {
  DndContext, DragOverlay, closestCorners, PointerSensor,
  useSensor, useSensors, useDroppable, useDraggable,
} from '@dnd-kit/core'
import { Plus, ChevronDown, ChevronRight, Calendar, DollarSign, Tag, GripVertical, Pencil, Trash2, Search, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/context/ToastContext'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useApp } from '@/context/AppContext'
import { collection, addDoc, updateDoc, doc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { useProducts } from '@/context/ProductsContext'

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

const LOSS_REASONS = [
  'Preço alto — concorrência mais barata',
  'Comprou em outro lugar',
  'Sem interesse no momento',
  'Sem resposta / contato perdido',
  'Preferiu produto diferente',
  'Outro',
]

const COLUMNS = [
  { id: 'novo-lead',  title: 'Novo Lead',   dot: 'bg-blue-500',   header: 'border-b-blue-500',   count_bg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' },
  { id: 'negociacao', title: 'Negociação',   dot: 'bg-yellow-500', header: 'border-b-yellow-500', count_bg: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400' },
  { id: 'follow-up',  title: 'Follow-up',   dot: 'bg-purple-500', header: 'border-b-purple-500', count_bg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400' },
  { id: 'fechado',    title: 'Fechado',     dot: 'bg-green-500',  header: 'border-b-green-500',  count_bg: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' },
  { id: 'perdido',    title: 'Perdido',     dot: 'bg-red-500',    header: 'border-b-red-500',    count_bg: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' },
]

// ─── Card component ───────────────────────────────────────────────────────────

function KanbanCard({ card, columnId, onEdit, onDelete, onConvertToSale }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: { card, columnId },
  })

  return (
    <div
      ref={setNodeRef}
      style={transform ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` } : undefined}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 select-none transition-all hover:shadow-md active:shadow-md ${isDragging ? 'opacity-40' : ''}`}
    >
      <div className="flex items-start gap-2 p-3.5">
        {/* Drag handle — único elemento que dispara drag */}
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing mt-0.5 flex-shrink-0 text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50">
          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300">{card.name.charAt(0)}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">{card.name}</p>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {columnId === 'fechado' && (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => onConvertToSale(card)}
                  title="Converter em Venda"
                  className="p-1 rounded-lg text-gray-300 dark:text-gray-600 hover:text-green-500 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ShoppingCart className="w-3 h-3" />
                </button>
              )}
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onEdit(card)}
                className="p-1 rounded-lg text-gray-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onDelete(card)}
                className="p-1 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          {card.product && (
            <div className="flex items-center gap-1 mt-1">
              <Tag className="w-3 h-3 text-gray-400 dark:text-gray-500" />
              <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{card.product}</span>
            </div>
          )}
          {card.note && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{card.note}</p>
          )}
          {card.lossReason && (
            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 italic line-clamp-1">{card.lossReason}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            {card.value ? (
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{fmt(card.value)}</span>
            ) : <span />}
            {card.followUpDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-orange-500" />
                <span className="text-[11px] text-orange-500 dark:text-orange-400 font-medium">
                  {new Date(card.followUpDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Column component ─────────────────────────────────────────────────────────

function KanbanColumn({ column, cards, collapsed, onToggleCollapse, onAddCard, onEditCard, onDeleteCard, onConvertToSale }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  if (collapsed) {
    return (
      <div className="flex-shrink-0 w-12 cursor-pointer" onClick={() => onToggleCollapse(column.id)}>
        <div className="rounded-2xl bg-gray-100/80 dark:bg-gray-800/60 flex flex-col items-center py-4 gap-3 h-64 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
          <span className={`w-2 h-2 rounded-full ${column.dot}`} />
          <span className="[writing-mode:vertical-rl] rotate-180 text-xs font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {column.title}
          </span>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${column.count_bg}`}>{cards.length}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-shrink-0 w-60">
      <div className={`rounded-2xl flex flex-col h-full transition-colors border ${
        isOver
          ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/30'
          : 'border-gray-200 dark:border-gray-700/60 bg-gray-100/60 dark:bg-gray-800/30'
      }`}>
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${column.dot}`} />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{column.title}</span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${column.count_bg}`}>{cards.length}</span>
            </div>
            <button
              onClick={() => onToggleCollapse(column.id)}
              className="p-0.5 rounded text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Drop zone */}
        <div ref={setNodeRef} className="flex-1 px-3 pb-2 space-y-2 min-h-[120px]">
          {cards.map((card) => (
            <KanbanCard key={card.id} card={card} columnId={column.id} onEdit={onEditCard} onDelete={onDeleteCard} onConvertToSale={onConvertToSale} />
          ))}
        </div>

        {/* Add button */}
        <div className="px-3 pb-3">
          <button
            onClick={() => onAddCard(column.id)}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 py-2 px-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-colors border border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const emptyCard = { name: '', note: '', product: '', value: '', followUpDate: '' }
const emptySaleForm = { clientName: '', product: '', value: '', paymentType: 'PIX', status: 'pago' }

export default function CRM() {
  const { addSale, addClient, inventory, updateInventoryItem } = useApp()
  const { products } = useProducts()
  const { addToast } = useToast()
  const [crmData, setCrmData] = useState({ 'novo-lead': [], negociacao: [], 'follow-up': [], fechado: [], perdido: [] })
  const [loading, setLoading] = useState(true)

  const [activeCard, setActiveCard] = useState(null)
  const [collapsed, setCollapsed] = useState({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const q = query(collection(db, 'crm'), orderBy('criadoEm', 'desc'))
        const snap = await getDocs(q)
        const grouped = { 'novo-lead': [], negociacao: [], 'follow-up': [], fechado: [], perdido: [] }
        snap.docs.forEach((d) => {
          const raw = d.data()
          const etapa = raw.etapa ?? 'novo-lead'
          if (grouped[etapa]) {
            grouped[etapa].push({
              id: d.id,
              name: raw.nome || '',
              product: raw.produto || '',
              value: raw.valor ?? null,
              note: raw.observacoes || '',
              followUpDate: raw.followUpDate || null,
              lossReason: raw.motivoPerda || null,
              convertido: raw.convertido ?? false,
            })
          }
        })
        setCrmData(grouped)
      } catch (err) {
        console.error('[Firebase] Erro ao carregar CRM:', err)
        addToast(`Erro ao carregar CRM: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const moveCRMCardLocal = async (cardId, fromCol, toCol, updates = {}) => {
    setCrmData((prev) => {
      const card = prev[fromCol]?.find((c) => c.id === cardId)
      if (!card) return prev
      return {
        ...prev,
        [fromCol]: prev[fromCol].filter((c) => c.id !== cardId),
        [toCol]: [...(prev[toCol] || []), { ...card, ...updates }],
      }
    })
    try {
      const fsUpdates = { etapa: toCol }
      if (updates.lossReason !== undefined) fsUpdates.motivoPerda = updates.lossReason
      if (updates.convertido !== undefined) fsUpdates.convertido = updates.convertido
      await updateDoc(doc(db, 'crm', cardId), fsUpdates)
    } catch (err) {
      console.error('[Firebase] Erro ao mover card:', err)
      addToast(`Erro ao mover: ${err.message}`)
    }
  }

  // New card dialog
  const [cardDialog, setCardDialog] = useState(false)
  const [targetCol, setTargetCol] = useState(null)
  const [cardForm, setCardForm] = useState(emptyCard)

  // Edit card dialog
  const [editDialog, setEditDialog] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [editForm, setEditForm] = useState(emptyCard)

  const handleOpenEdit = (card) => {
    setEditingCard(card)
    setEditForm({
      name: card.name,
      note: card.note || '',
      product: card.product || '',
      value: card.value != null ? String(card.value) : '',
      followUpDate: card.followUpDate || '',
    })
    setEditDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!editingCard || !editForm.name.trim()) return
    try {
      await updateDoc(doc(db, 'crm', editingCard.id), {
        nome: editForm.name.trim(),
        observacoes: editForm.note.trim(),
        produto: editForm.product,
        valor: editForm.value ? parseFloat(editForm.value) : null,
        followUpDate: editForm.followUpDate || null,
      })
      setCrmData((prev) => {
        const next = {}
        for (const [colId, cards] of Object.entries(prev)) {
          next[colId] = cards.map((c) =>
            c.id === editingCard.id
              ? {
                  ...c,
                  name: editForm.name.trim(),
                  note: editForm.note.trim(),
                  product: editForm.product,
                  value: editForm.value ? parseFloat(editForm.value) : null,
                  followUpDate: editForm.followUpDate || null,
                }
              : c
          )
        }
        return next
      })
      setEditDialog(false)
      setEditingCard(null)
    } catch (err) {
      console.error('[Firebase] Erro ao editar lead:', err)
      addToast(`Erro ao editar: ${err.message}`)
    }
  }

  // Delete card
  const [confirmDeleteCard, setConfirmDeleteCard] = useState(null)

  const handleDeleteCard = async () => {
    if (!confirmDeleteCard) return
    const { id, columnId } = confirmDeleteCard
    try {
      await deleteDoc(doc(db, 'crm', id))
      setCrmData((prev) => ({
        ...prev,
        [columnId]: (prev[columnId] || []).filter((c) => c.id !== id),
      }))
      setConfirmDeleteCard(null)
      addToast('Lead removido.')
    } catch (err) {
      console.error('[Firebase] Erro ao remover lead:', err)
      addToast(`Erro ao remover: ${err.message}`)
    }
  }

  // Loss reason dialog
  const [lossDialog, setLossDialog] = useState(false)
  const [lossReason, setLossReason] = useState('')
  const [customLoss, setCustomLoss] = useState('')
  const [pendingMove, setPendingMove] = useState(null)

  // Sale creation dialog (auto on "Fechado")
  const [saleDialog, setSaleDialog] = useState(false)
  const [saleForm, setSaleForm] = useState(emptySaleForm)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const toggleCollapse = (colId) => setCollapsed((p) => ({ ...p, [colId]: !p[colId] }))

  const openAddCard = (columnId) => {
    setTargetCol(columnId)
    setCardForm(emptyCard)
    setCardDialog(true)
  }

  const handleSaveCard = async () => {
    if (!cardForm.name.trim()) return
    try {
      const docRef = await addDoc(collection(db, 'crm'), {
        nome: cardForm.name.trim(),
        produto: cardForm.product,
        valor: cardForm.value ? parseFloat(cardForm.value) : null,
        observacoes: cardForm.note.trim(),
        followUpDate: cardForm.followUpDate || null,
        etapa: targetCol,
        motivoPerda: null,
        convertido: false,
        criadoEm: Timestamp.now(),
      })
      setCrmData((prev) => ({
        ...prev,
        [targetCol]: [...(prev[targetCol] || []), {
          id: docRef.id,
          name: cardForm.name.trim(),
          note: cardForm.note.trim(),
          product: cardForm.product,
          value: cardForm.value ? parseFloat(cardForm.value) : null,
          followUpDate: cardForm.followUpDate || null,
          lossReason: null,
          convertido: false,
        }],
      }))
      setCardDialog(false)
    } catch (err) {
      console.error('[Firebase] Erro ao criar lead:', err)
      addToast(`Erro ao criar lead: ${err.message}`)
    }
  }

  // Drag & drop
  const handleDragStart = ({ active }) => {
    setActiveCard(active.data.current?.card ?? null)
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveCard(null)
    if (!over || !active.data.current) return

    const fromCol = active.data.current.columnId
    const toCol = String(over.id)
    if (fromCol === toCol) return

    const card = (crmData[fromCol] ?? []).find((c) => c.id === active.id)
    if (!card) return

    if (toCol === 'perdido') {
      setPendingMove({ card, fromCol })
      setLossReason('')
      setCustomLoss('')
      setLossDialog(true)
      return
    }

    if (toCol === 'fechado') {
      setPendingMove({ card, fromCol })
      setSaleForm({
        clientName: card.name,
        product: card.product || '',
        value: card.value ? String(card.value) : '',
        paymentType: 'PIX',
        status: 'pago',
      })
      setSaleDialog(true)
      return
    }

    moveCRMCardLocal(card.id, fromCol, toCol)
  }

  const confirmLoss = async () => {
    const reason = lossReason === 'Outro' ? customLoss.trim() : lossReason
    if (!reason) return
    await moveCRMCardLocal(pendingMove.card.id, pendingMove.fromCol, 'perdido', { lossReason: reason })
    setLossDialog(false)
    setPendingMove(null)
  }

  const handleConvertToSale = (card) => {
    if (card.convertido) {
      addToast('Este lead já foi convertido em venda.')
      return
    }
    setPendingMove({ card, fromCol: 'fechado', skipMove: true })
    setSaleForm({
      clientName: card.name,
      product: card.product || '',
      value: card.value ? String(card.value) : '',
      paymentType: 'PIX',
      status: 'pago',
    })
    setSaleDialog(true)
  }

  const confirmSale = async () => {
    if (!saleForm.clientName.trim() || !saleForm.value) return
    const val = parseFloat(saleForm.value)
    const cardId = pendingMove?.card?.id

    try {
      // 1. Salva venda no Firestore
      const vendaRef = await addDoc(collection(db, 'vendas'), {
        clienteNome: saleForm.clientName.trim(),
        produto: saleForm.product,
        valor: val,
        formaPagamento: saleForm.paymentType,
        status: 'pendente',
        criadoEm: Timestamp.now(),
        leadId: cardId ?? null,
      })

      // 1b. Registra receita no financeiro
      await addDoc(collection(db, 'financeiro'), {
        label: `${saleForm.clientName.trim()} — ${saleForm.product}`,
        valor: val,
        month: new Date().toISOString().slice(0, 7),
        category: 'receita',
        grupo: '',
        criadoEm: Timestamp.now(),
        vendaId: vendaRef.id,
      })

      // 2. Move card e marca como convertido (ou só marca se já estava em fechado)
      if (!pendingMove?.skipMove) {
        await moveCRMCardLocal(cardId, pendingMove.fromCol, 'fechado', { convertido: true })
      } else {
        await updateDoc(doc(db, 'crm', cardId), { convertido: true })
        setCrmData((prev) => {
          const next = { ...prev }
          next['fechado'] = (next['fechado'] || []).map((c) =>
            c.id === cardId ? { ...c, convertido: true } : c
          )
          return next
        })
      }

      // 3. Atualiza estoque — primeiro item disponível com o nome do produto
      const estoqueItem = inventory.find(
        (i) => i.name === saleForm.product && i.status === 'disponível'
      )
      if (estoqueItem) {
        updateInventoryItem(estoqueItem.id, { status: 'vendido' })
      }

      // 4. Mantém AppContext atualizado para outras páginas
      addSale({
        id: String(Date.now()),
        vendaId: vendaRef.id,
        clientName: saleForm.clientName.trim(),
        product: saleForm.product,
        totalValue: val,
        payments: [{ type: saleForm.paymentType, value: val }],
        status: saleForm.status,
        date: new Date().toISOString().split('T')[0],
      })
      addClient({
        id: String(Date.now() + 1),
        name: saleForm.clientName.trim(),
        phone: '',
        email: '',
        date: new Date().toISOString().split('T')[0],
      })

      addToast('Venda registrada com sucesso!')
      setSaleDialog(false)
      setPendingMove(null)
    } catch (err) {
      console.error('[Firebase] Erro ao registrar venda:', err)
      addToast(`Erro ao registrar venda: ${err.message}`)
    }
  }

  const totalPipeline = Object.values(crmData)
    .flat()
    .reduce((s, c) => s + (c.value || 0), 0)

  return (
    <div className="p-4 sm:p-6 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6 flex-shrink-0">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">CRM</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Pipeline:{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">{fmt(totalPipeline)}</span>
            {' '}— arraste entre colunas
          </p>
        </div>
        <div className="flex gap-2 flex-1 sm:flex-none">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              placeholder="Buscar lead..."
              className="pl-8 h-9 text-sm w-full sm:w-48 dark:bg-gray-800 dark:border-gray-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={() => openAddCard('novo-lead')} className="flex-shrink-0 h-9">
            <Plus className="w-4 h-4 mr-1.5" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start min-h-0">
          {loading ? (
            <div className="flex-1 flex items-center justify-center py-20 text-gray-400 dark:text-gray-500">
              Carregando leads...
            </div>
          ) : COLUMNS.map((col) => {
            const allCards = crmData[col.id] ?? []
            const visibleCards = search.trim()
              ? allCards.filter(
                  (c) =>
                    c.name.toLowerCase().includes(search.toLowerCase()) ||
                    (c.product ?? '').toLowerCase().includes(search.toLowerCase()),
                )
              : allCards
            return (
              <KanbanColumn
                key={col.id}
                column={col}
                cards={visibleCards}
                collapsed={!!collapsed[col.id]}
                onToggleCollapse={toggleCollapse}
                onAddCard={openAddCard}
                onEditCard={handleOpenEdit}
                onDeleteCard={(card) => setConfirmDeleteCard({ id: card.id, columnId: col.id, name: card.name })}
                onConvertToSale={handleConvertToSale}
              />
            )
          })}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeCard && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3.5 shadow-2xl border-2 border-blue-400 w-56 rotate-2 opacity-95">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{activeCard.name}</p>
              {activeCard.product && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activeCard.product}</p>}
              {activeCard.value && <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1">{fmt(activeCard.value)}</p>}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* ── Add card dialog ─────────────────────────────────────────────────── */}
      <Dialog open={cardDialog} onOpenChange={setCardDialog}>
        <DialogContent className="sm:max-w-sm dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Novo Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="dark:text-gray-300">Nome do cliente *</Label>
              <Input placeholder="Ex: João Silva" value={cardForm.name} onChange={(e) => setCardForm((p) => ({ ...p, name: e.target.value }))} className="dark:bg-gray-800 dark:border-gray-700" />
            </div>
            <div className="space-y-1.5">
              <Label className="dark:text-gray-300">Produto de interesse</Label>
              <Select value={cardForm.product} onValueChange={(v) => setCardForm((p) => ({ ...p, product: v }))}>
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-800 max-h-56">
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.nome} className="dark:text-gray-200 dark:focus:bg-gray-800">{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="dark:text-gray-300">Valor do interesse (R$)</Label>
              <Input type="number" placeholder="0.00" value={cardForm.value} onChange={(e) => setCardForm((p) => ({ ...p, value: e.target.value }))} className="dark:bg-gray-800 dark:border-gray-700" />
            </div>
            <div className="space-y-1.5">
              <Label className="dark:text-gray-300">Data de follow-up</Label>
              <Input type="date" value={cardForm.followUpDate} onChange={(e) => setCardForm((p) => ({ ...p, followUpDate: e.target.value }))} className="dark:bg-gray-800 dark:border-gray-700 dark:[color-scheme:dark]" />
            </div>
            <div className="space-y-1.5">
              <Label className="dark:text-gray-300">Observação</Label>
              <Textarea placeholder="Ex: Interessado no iPhone 15 Pro Max" value={cardForm.note} onChange={(e) => setCardForm((p) => ({ ...p, note: e.target.value }))} className="dark:bg-gray-800 dark:border-gray-700" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCardDialog(false)} className="dark:border-gray-700 dark:text-gray-300">Cancelar</Button>
            <Button onClick={handleSaveCard}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Loss reason dialog ──────────────────────────────────────────────── */}
      <Dialog open={lossDialog} onOpenChange={(v) => { if (!v) setPendingMove(null); setLossDialog(v) }}>
        <DialogContent className="sm:max-w-sm dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100 text-red-600 dark:text-red-400">Motivo da Perda</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Por que o lead <strong className="text-gray-900 dark:text-gray-100">{pendingMove?.card.name}</strong> foi perdido?
          </p>
          <div className="space-y-3">
            <Select value={lossReason} onValueChange={setLossReason}>
              <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700"><SelectValue placeholder="Selecione o motivo *" /></SelectTrigger>
              <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                {LOSS_REASONS.map((r) => (
                  <SelectItem key={r} value={r} className="dark:text-gray-200 dark:focus:bg-gray-800">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {lossReason === 'Outro' && (
              <Textarea
                placeholder="Descreva o motivo..."
                value={customLoss}
                onChange={(e) => setCustomLoss(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-700"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setLossDialog(false); setPendingMove(null) }} className="dark:border-gray-700 dark:text-gray-300">Cancelar</Button>
            <Button variant="destructive" onClick={confirmLoss} disabled={!lossReason || (lossReason === 'Outro' && !customLoss.trim())}>
              Confirmar Perda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Sale creation dialog ────────────────────────────────────────────── */}
      <Dialog open={saleDialog} onOpenChange={(v) => { if (!v) setPendingMove(null); setSaleDialog(v) }}>
        <DialogContent className="sm:max-w-sm dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100 text-green-600 dark:text-green-400">🎉 Criar Venda</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Registrar venda para{' '}
            <strong className="text-gray-900 dark:text-gray-100">{pendingMove?.card.name}</strong>?
          </p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="dark:text-gray-300">Produto</Label>
              <Select value={saleForm.product} onValueChange={(v) => setSaleForm((p) => ({ ...p, product: v }))}>
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-800 max-h-56">
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.nome} className="dark:text-gray-200 dark:focus:bg-gray-800">{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="dark:text-gray-300">Valor (R$) *</Label>
              <Input type="number" placeholder="0.00" value={saleForm.value} onChange={(e) => setSaleForm((p) => ({ ...p, value: e.target.value }))} className="dark:bg-gray-800 dark:border-gray-700" />
            </div>
            <div className="space-y-1.5">
              <Label className="dark:text-gray-300">Pagamento</Label>
              <Select value={saleForm.paymentType} onValueChange={(v) => setSaleForm((p) => ({ ...p, paymentType: v }))}>
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700"><SelectValue /></SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                  {['PIX', 'Cartão Crédito', 'Cartão Débito', 'Dinheiro', 'Boleto'].map((t) => (
                    <SelectItem key={t} value={t} className="dark:text-gray-200 dark:focus:bg-gray-800">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="dark:text-gray-300">Status</Label>
              <Select value={saleForm.status} onValueChange={(v) => setSaleForm((p) => ({ ...p, status: v }))}>
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700"><SelectValue /></SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                  <SelectItem value="pago" className="dark:text-gray-200 dark:focus:bg-gray-800">Pago</SelectItem>
                  <SelectItem value="pendente" className="dark:text-gray-200 dark:focus:bg-gray-800">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            {!pendingMove?.skipMove && (
              <Button variant="outline" onClick={async () => { await moveCRMCardLocal(pendingMove?.card.id, pendingMove?.fromCol, 'fechado'); setSaleDialog(false); setPendingMove(null) }} className="dark:border-gray-700 dark:text-gray-300">
                Mover sem venda
              </Button>
            )}
            <Button onClick={confirmSale} className="bg-green-600 hover:bg-green-700">
              Criar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit card dialog ────────────────────────────────────────────────── */}
      <Dialog open={editDialog} onOpenChange={(v) => { if (!v) setEditingCard(null); setEditDialog(v) }}>
        <DialogContent className="sm:max-w-sm dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Editar Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="dark:text-gray-300">Nome do cliente *</Label>
              <Input
                placeholder="Ex: João Silva"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                className="dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="dark:text-gray-300">Produto de interesse</Label>
              <Select value={editForm.product} onValueChange={(v) => setEditForm((p) => ({ ...p, product: v }))}>
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-800 max-h-56">
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.nome} className="dark:text-gray-200 dark:focus:bg-gray-800">{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="dark:text-gray-300">Valor do interesse (R$)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={editForm.value}
                onChange={(e) => setEditForm((p) => ({ ...p, value: e.target.value }))}
                className="dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="dark:text-gray-300">Data de follow-up</Label>
              <Input
                type="date"
                value={editForm.followUpDate}
                onChange={(e) => setEditForm((p) => ({ ...p, followUpDate: e.target.value }))}
                className="dark:bg-gray-800 dark:border-gray-700 dark:[color-scheme:dark]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="dark:text-gray-300">Observação</Label>
              <Textarea
                placeholder="Notas sobre o lead..."
                value={editForm.note}
                onChange={(e) => setEditForm((p) => ({ ...p, note: e.target.value }))}
                className="dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)} className="dark:border-gray-700 dark:text-gray-300">
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete card confirmation ─────────────────────────────────────────── */}
      <Dialog open={!!confirmDeleteCard} onOpenChange={(v) => !v && setConfirmDeleteCard(null)}>
        <DialogContent className="sm:max-w-xs dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100 text-red-600 dark:text-red-400">
              Remover lead
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tem certeza que deseja remover{' '}
            <strong className="text-gray-900 dark:text-gray-100">{confirmDeleteCard?.name}</strong>?
            Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteCard(null)}
              className="dark:border-gray-700 dark:text-gray-300"
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteCard}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
