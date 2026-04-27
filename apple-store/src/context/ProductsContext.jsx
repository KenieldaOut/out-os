import { createContext, useContext, useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'
import { PRODUCT_CATEGORIES } from '@/data/products'

const ProductsContext = createContext(null)

// Fallback imediato enquanto Firestore carrega ou se estiver vazio
const STATIC_PRODUCTS = Object.entries(PRODUCT_CATEGORIES).flatMap(([categoria, nomes], ci) =>
  nomes.map((nome, ni) => ({ id: `default-${ci}-${ni}`, nome, categoria, isDefault: true }))
)

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(STATIC_PRODUCTS)
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, 'produtos'), orderBy('categoria'), orderBy('nome'))
        const snap = await getDocs(q)
        if (!snap.empty) {
          setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        }
      } catch (err) {
        console.error('[Firebase] Erro ao carregar produtos:', err)
      } finally {
        setLoadingProducts(false)
      }
    }
    load()
  }, [])

  return (
    <ProductsContext.Provider value={{ products, setProducts, loadingProducts }}>
      {children}
    </ProductsContext.Provider>
  )
}

export const useProducts = () => {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider')
  return ctx
}
