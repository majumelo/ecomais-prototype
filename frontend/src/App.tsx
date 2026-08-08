import { useEffect, useState } from 'react'
import VoltarAoTopo from './components/portal/VoltarAoTopo'
import Navbar from './components/portal/Navbar'
import LandingPage from './components/portal/LandingPage'
import EmBreve from './components/portal/EmBreve'
import Footer from './components/portal/Footer'
import EcomaisApp from './components/EcomaisApp'
import { buscarServicos, type ServicoPortal } from './api'

type Secao = 'inicio' | string

function lerSecaoDaUrl(): Secao {
  const rota = window.location.hash.replace(/^#\/?/, '')
  return rota || 'inicio'
}

export default function App() {
  const [secao, setSecao] = useState<Secao>(() => lerSecaoDaUrl())
  const [servicos, setServicos] = useState<ServicoPortal[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    buscarServicos()
      .then(setServicos)
      .catch(() => setErro('Não foi possível carregar os serviços do portal.'))
      .finally(() => setCarregando(false))
  }, [])

  useEffect(() => {
    const aoMudarHash = () => setSecao(lerSecaoDaUrl())
    window.addEventListener('hashchange', aoMudarHash)
    return () => window.removeEventListener('hashchange', aoMudarHash)
  }, [])

  function navegar(destino: Secao) {
    window.location.hash = destino === 'inicio' ? '/' : `/${destino}`
    setSecao(destino)
  }

  if (secao === 'meu-lixo') {
    return (
      <>
        <EcomaisApp aoVoltar={() => navegar('inicio')} />
        <VoltarAoTopo />
      </>
    )
  }

  if (carregando) {
    return (
      <div className="portal">
        <p className="aviso portal-carregando">Carregando Minha Cidade Virtual…</p>
      </div>
    )
  }

  const servico = servicos.find((s) => s.id === secao)

  return (
    <>
      <div className="portal">
        <Navbar servicos={servicos} secaoAtiva={secao} onNavegar={navegar} />
        {erro && <p className="aviso aviso-erro portal-conteudo">{erro}</p>}
        {servico ? (
          <EmBreve servico={servico} aoVoltar={() => navegar('inicio')} />
        ) : (
          <LandingPage servicos={servicos} onNavegar={navegar} />
        )}
        <Footer />
      </div>
      <VoltarAoTopo />
    </>
  )
}
