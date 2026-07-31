import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { buscarPosicoesCaminhoes, type PosicaoCaminhao } from '../api'

// Ícone customizado (ponto pulsante) — evita depender dos ícones padrão do
// Leaflet, que costumam quebrar em builds com Vite/bundlers.
const iconeCaminhao = L.divIcon({
  className: 'icone-caminhao',
  html: '<span class="pulso"></span><span class="ponto"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

function formatarHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const CENTRO_MAPA: [number, number] = [-6.4858, -36.1519] // Cuité, PB
const INTERVALO_ATUALIZACAO_MS = 4000

export default function GpsCaminhao() {
  const [posicoes, setPosicoes] = useState<PosicaoCaminhao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true

    const carregar = () => {
      buscarPosicoesCaminhoes()
        .then((dados) => {
          if (ativo) setPosicoes(dados)
        })
        .catch(() => {
          if (ativo) setErro('Não foi possível carregar a posição dos caminhões.')
        })
        .finally(() => {
          if (ativo) setCarregando(false)
        })
    }

    carregar() // busca imediata
    // Faz "tempo real" via polling — troque por WebSocket quando o volume de
    // caminhões justificar (ver docs/02_DOCUMENTACAO_TECNICA.md, seção 4).
    const intervalo = setInterval(carregar, INTERVALO_ATUALIZACAO_MS)

    return () => {
      ativo = false
      clearInterval(intervalo)
    }
  }, [])

  return (
    <section className="tela">
      <header className="tela-header">
        <span className="eyebrow eyebrow-live">
          <span className="bolinha-live" /> ao vivo
        </span>
        <h1>Onde está o caminhão agora</h1>
      </header>

      {erro && <p className="aviso">{erro}</p>}

      <div className="mapa-container">
        <MapContainer center={CENTRO_MAPA} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {!carregando &&
            posicoes.map((p) => (
              <Marker
                key={p.caminhaoId}
                position={[Number(p.latitude), Number(p.longitude)]}
                icon={iconeCaminhao}
              >
                <Popup>
                  <strong>Caminhão {p.placa}</strong>
                  <br />
                  Rota: {p.bairroNome}
                  <br />
                  Atualizado às {formatarHora(p.atualizadoEm)}
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

      <p className="nota">
        * Posição atualizada a cada {INTERVALO_ATUALIZACAO_MS / 1000}s a partir do banco de
        dados. Em produção, o dispositivo do motorista grava uma nova linha em
        `posicoes_gps` a cada poucos segundos.
      </p>
    </section>
  )
}
