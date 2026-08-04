import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function VoltarAoTopo() {
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const aoRolar = () => setVisivel(window.scrollY > 400)
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  if (!visivel) return null

  return (
    <button
      className="voltar-topo"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Voltar ao topo"
    >
      <ArrowUp size={20} strokeWidth={2.4} />
    </button>
  )
}
