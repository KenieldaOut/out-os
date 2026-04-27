import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
      <p className="text-8xl font-bold text-gray-100 dark:text-gray-800 select-none">404</p>
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Página não encontrada</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">A rota que você acessou não existe neste sistema.</p>
      </div>
      <Link to="/">
        <Button variant="outline" className="gap-2 dark:border-gray-700 dark:text-gray-300">
          <Home className="w-4 h-4" />
          Voltar ao Dashboard
        </Button>
      </Link>
    </div>
  )
}
