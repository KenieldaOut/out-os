import { createContext, useContext, useState, useEffect } from 'react'
import { initialClients, initialSales, initialCRMData, initialInventory } from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem('darkMode')) ?? false } catch { return false }
  })
  const [clients, setClients] = useState(initialClients)
  const [sales, setSales] = useState(initialSales)
  const [crmData, setCrmData] = useState(initialCRMData)
  const [inventory, setInventory] = useState(initialInventory)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  const addSale = (sale) => setSales((prev) => [sale, ...prev])

  const addClient = (client) => {
    setClients((prev) => {
      if (prev.some((c) => c.name.toLowerCase() === client.name.toLowerCase())) return prev
      return [client, ...prev]
    })
  }

  const deleteClient = (id) => setClients((prev) => prev.filter((c) => c.id !== id))

  const addInventoryItem = (item) => setInventory((prev) => [item, ...prev])

  const updateInventoryItem = (id, updates) =>
    setInventory((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))

  const moveCRMCard = (cardId, fromCol, toCol, updates = {}) => {
    setCrmData((prev) => {
      const card = prev[fromCol]?.find((c) => c.id === cardId)
      if (!card) return prev
      return {
        ...prev,
        [fromCol]: prev[fromCol].filter((c) => c.id !== cardId),
        [toCol]: [...(prev[toCol] || []), { ...card, ...updates }],
      }
    })
  }

  const addCRMCard = (columnId, card) => {
    setCrmData((prev) => ({
      ...prev,
      [columnId]: [...(prev[columnId] || []), card],
    }))
  }

  const followUpAlerts = Object.values(crmData)
    .flat()
    .filter((c) => c.followUpDate)
    .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate))

  return (
    <AppContext.Provider
      value={{
        darkMode,
        setDarkMode,
        clients,
        setClients,
        addClient,
        deleteClient,
        sales,
        setSales,
        addSale,
        crmData,
        setCrmData,
        moveCRMCard,
        addCRMCard,
        inventory,
        setInventory,
        addInventoryItem,
        updateInventoryItem,
        followUpAlerts,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
