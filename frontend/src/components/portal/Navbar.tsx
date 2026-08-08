import type { ServicoPortal } from '../../api'
import { iconeDoServico } from '../../servicoIcones'
import { useScrolled } from '../../hooks/useScrolled'

export default function Navbar({
  servicos,
  secaoAtiva,
  onNavegar,
}: {
  servicos: ServicoPortal[]
  secaoAtiva: string
  onNavegar: (secao: string) => void
}) {
  const rolado = useScrolled(12)

  return (
    <header className={`portal-header ${rolado ? 'portal-header-scrolled' : ''}`}>
      <div className="portal-header-linha">
        <button className="portal-marca" onClick={() => onNavegar('inicio')}>
          <span className="portal-marca-texto">
            <span className="portal-titulo">MINHA CIDADE VIRTUAL</span>
            <span className="portal-subtitulo">Cuité · PB</span>
          </span>
        </button>

        <nav className="portal-nav">
          {servicos.map((s) => {
            const Icone = iconeDoServico(s.id)
            return (
              <button
                key={s.id}
                className={`portal-nav-item ${secaoAtiva === s.id ? 'portal-nav-item-ativo' : ''}`}
                onClick={() => onNavegar(s.id)}
              >
                <Icone size={15} strokeWidth={2.2} aria-hidden="true" />
                {s.nome}
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
