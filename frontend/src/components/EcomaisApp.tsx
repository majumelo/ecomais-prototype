import { useState } from 'react'
import { ArrowLeft, Clock, MapPin, Truck, User, type LucideIcon } from 'lucide-react'
import HorarioColeta from './HorarioColeta'
import MapaInterativo from './MapaInterativo'
import GpsCaminhao from './GpsCaminhao'
import Login from './Login'

type Aba = 'horario' | 'mapa' | 'caminhao' | 'login'

const ABAS: { id: Aba; label: string; Icone: LucideIcon }[] = [
  { id: 'horario', label: 'Horário', Icone: Clock },
  { id: 'mapa', label: 'Mapa', Icone: MapPin },
  { id: 'caminhao', label: 'Caminhão', Icone: Truck },
  { id: 'login', label: 'Login', Icone: User },
]

export default function EcomaisApp({ aoVoltar }: { aoVoltar: () => void }) {
  const [aba, setAba] = useState<Aba>('horario')

  return (
    <div className="app">
      <div className="faixa-separacao" aria-hidden="true" />

      <header className="app-topo">
        <button className="app-voltar" onClick={aoVoltar}>
          <ArrowLeft size={14} />
          Sua Cidade
        </button>
        <span className="marca">Ecomais</span>
      </header>

      <main className="app-conteudo">
        {aba === 'horario' && <HorarioColeta />}
        {aba === 'mapa' && <MapaInterativo />}
        {aba === 'caminhao' && <GpsCaminhao />}
        {aba === 'login' && <Login />}
      </main>

      <nav className="app-nav">
        {ABAS.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${aba === item.id ? 'nav-item-ativo' : ''}`}
            onClick={() => setAba(item.id)}
          >
            <item.Icone size={19} strokeWidth={2.1} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
