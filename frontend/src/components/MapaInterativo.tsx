import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { buscarPontosColeta, type PontoColeta, type TipoResiduo } from '../api'

const CORES_RESIDUO: Record<TipoResiduo, string> = {
  organico: '#8B5E3C', // marrom — orgânico
  reciclavel: '#2F6FED', // azul — reciclável
  geral: '#6B7280',
}

const LEGENDA: { tipo: TipoResiduo; label: string }[] = [
  { tipo: 'reciclavel', label: 'Reciclável' },
  { tipo: 'organico', label: 'Orgânico' },
]

const CENTRO_MAPA: [number, number] = [-6.4858, -36.1519] // Cuité, PB

export default function MapaInterativo() {
  const [filtro, setFiltro] = useState<TipoResiduo | 'todos'>('todos')
  const [pontos, setPontos] = useState<PontoColeta[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    setCarregando(true)
    buscarPontosColeta(filtro)
      .then(setPontos)
      .catch(() => setErro('Não foi possível carregar os pontos de coleta.'))
      .finally(() => setCarregando(false))
  }, [filtro])

  return (
    <section className="tela">
      <header className="tela-header">
        <span className="eyebrow">Mapa interativo</span>
        <h1>Pontos de coleta perto de você</h1>
      </header>

      <div className="filtro-chip-linha">
        <button
          className={`chip ${filtro === 'todos' ? 'chip-ativo' : ''}`}
          onClick={() => setFiltro('todos')}
        >
          Todos
        </button>
        {LEGENDA.map((l) => (
          <button
            key={l.tipo}
            className={`chip ${filtro === l.tipo ? 'chip-ativo' : ''}`}
            style={{ borderColor: CORES_RESIDUO[l.tipo] }}
            onClick={() => setFiltro(l.tipo)}
          >
            <span className="chip-dot" style={{ background: CORES_RESIDUO[l.tipo] }} />
            {l.label}
          </button>
        ))}
      </div>

      {erro && <p className="aviso">{erro}</p>}

      <div className="mapa-container">
        <MapContainer center={CENTRO_MAPA} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {!carregando &&
            pontos.map((ponto) => (
              <CircleMarker
                key={ponto.id}
                center={[Number(ponto.latitude), Number(ponto.longitude)]}
                radius={9}
                pathOptions={{
                  color: CORES_RESIDUO[ponto.tipoResiduo],
                  fillColor: CORES_RESIDUO[ponto.tipoResiduo],
                  fillOpacity: 0.85,
                }}
              >
                <Popup>
                  <strong>{ponto.nome}</strong>
                  <br />
                  Bairro: {ponto.bairroNome}
                  <br />
                  Tipo: {ponto.tipoResiduo}
                </Popup>
              </CircleMarker>
            ))}
        </MapContainer>
      </div>
    </section>
  )
}
