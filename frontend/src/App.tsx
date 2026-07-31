import { useState } from 'react'
import HorarioColeta from './components/HorarioColeta'
import MapaInterativo from './components/MapaInterativo'
import GpsCaminhao from './components/GpsCaminhao'
import Login from './components/Login'

type Aba = 'horario' | 'mapa' | 'caminhao' | 'login'

const ABAS: { id: Aba; label: string; emoji: string }[] = [
  { id: 'horario', label: 'Horário', emoji: '🕒' },
  { id: 'mapa', label: 'Mapa', emoji: '📍' },
  { id: 'caminhao', label: 'Caminhão', emoji: '🚛' },
  { id: 'login', label: 'Login', emoji: '👤' },
]

export default function App() {
  const [aba, setAba] = useState<Aba>('horario')

  return (
    <div className="app">
      <div className="faixa-separacao" aria-hidden="true" />

      <header className="app-topo">
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
