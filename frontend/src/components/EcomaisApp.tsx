import { useState } from 'react'
import HorarioColeta from './HorarioColeta'
import MapaInterativo from './MapaInterativo'
import GpsCaminhao from './GpsCaminhao'
import Login from './Login'

type Aba = 'horario' | 'mapa' | 'caminhao' | 'login'

const ABAS: { id: Aba; label: string; emoji: string }[] = [
  { id: 'horario', label: 'Horário', emoji: '🕒' },
  { id: 'mapa', label: 'Mapa', emoji: '📍' },
  { id: 'caminhao', label: 'Caminhão', emoji: '🚛' },
  { id: 'login', label: 'Login', emoji: '👤' },
]

export default function EcomaisApp({ aoVoltar }: { aoVoltar: () => void }) {
  const [aba, setAba] = useState<Aba>('horario')

  return (
    <div className="app">
      <div className="faixa-separacao" aria-hidden="true" />

      <header className="app-topo">
        <button className="app-voltar" onClick={aoVoltar}>
          ← Sua Cidade
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
            <span className="nav-emoji" aria-hidden="true">
              {item.emoji}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
