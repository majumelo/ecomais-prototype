import type { ServicoPortal } from '../../api'

export default function Navbar({
  servicos,
  secaoAtiva,
  onNavegar,
}: {
  servicos: ServicoPortal[]
  secaoAtiva: string
  onNavegar: (secao: string) => void
}) {
  return (
    <header className="portal-header">
      <button className="portal-marca" onClick={() => onNavegar('inicio')}>
        <span className="portal-titulo">SUA CIDADE</span>
        <span className="portal-subtitulo">Cuité · PB</span>
      </button>

      <nav className="portal-nav">
        {servicos.map((s) => (
          <button
            key={s.id}
            className={`portal-nav-item ${secaoAtiva === s.id ? 'portal-nav-item-ativo' : ''}`}
            onClick={() => onNavegar(s.id)}
          >
            <span aria-hidden="true">{s.emoji}</span> {s.nome}
          </button>
        ))}
      </nav>
    </header>
  )
}
