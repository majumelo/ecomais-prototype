import { useMemo, useState } from 'react'
import { BadgeCheck, FolderCheck, RefreshCcw, Search, Smartphone } from 'lucide-react'
import type { ServicoPortal } from '../../api'
import { iconeDoServico } from '../../servicoIcones'
import { useReveal } from '../../hooks/useReveal'
import ServicoCard from './ServicoCard'

const BENEFICIOS = [
  {
    Icone: FolderCheck,
    titulo: 'Tudo em um só lugar',
    texto: 'Os serviços da Prefeitura reunidos num único portal, sem precisar procurar em vários sites.',
  },
  {
    Icone: Smartphone,
    titulo: 'Direto do seu celular',
    texto: 'Funciona no navegador do celular ou do computador, sem precisar instalar nada.',
  },
  {
    Icone: RefreshCcw,
    titulo: 'Sempre atualizado',
    texto: 'As informações são mantidas pela própria Prefeitura e chegam até você em tempo real.',
  },
]

export default function LandingPage({
  servicos,
  onNavegar,
}: {
  servicos: ServicoPortal[]
  onNavegar: (secao: string) => void
}) {
  const [busca, setBusca] = useState('')
  const destaque = servicos.find((s) => s.disponivel)
  const teaser = servicos.find((s) => !s.disponivel) ?? servicos[1]

  const heroReveal = useReveal<HTMLDivElement>()
  const beneficiosReveal = useReveal<HTMLDivElement>(0.1)

  const servicosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return servicos
    return servicos.filter(
      (s) => s.nome.toLowerCase().includes(termo) || s.descricao.toLowerCase().includes(termo),
    )
  }, [servicos, busca])

  const IconeMeuLixo = destaque ? iconeDoServico(destaque.id) : null
  const IconeTeaser = teaser ? iconeDoServico(teaser.id) : null

  return (
    <>
      <section className="portal-secao portal-secao-hero">
        <div className="portal-secao-inner">
          <div
            ref={heroReveal.ref}
            className={`portal-hero reveal ${heroReveal.visivel ? 'reveal-visivel' : ''}`}
          >
            <div className="portal-hero-texto">
              <span className="portal-eyebrow-pill">
                <BadgeCheck size={14} strokeWidth={2.4} />
                Portal oficial do município
              </span>

              <h1>
                Todos os serviços da sua Prefeitura, <span className="destaque-serif">em um só lugar</span>
              </h1>

              <p>
                O <strong>Sua Cidade</strong> reúne os serviços públicos do seu dia a dia num só portal. Hoje você
                acompanha a coleta de lixo em tempo real; em breve, também vai cuidar de matrícula escolar,
                agendamentos de saúde e serviços de cidadania — sem sair de casa.
              </p>

              <form className="portal-busca" onSubmit={(e) => e.preventDefault()} role="search">
                <label className="portal-busca-campo">
                  <Search size={17} className="portal-busca-icone" aria-hidden="true" />
                  <input
                    type="search"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar um serviço (ex: lixo, saúde...)"
                    aria-label="Buscar um serviço"
                  />
                </label>
              </form>

              <div className="portal-botoes-hero">
                {destaque && (
                  <button className="botao botao-lg" onClick={() => onNavegar(destaque.id)}>
                    Acessar {destaque.nome}
                  </button>
                )}
                <button
                  className="botao botao-secundario botao-lg"
                  onClick={() => document.getElementById('servicos')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Ver todos os serviços
                </button>
              </div>
            </div>

            <div className="portal-hero-visual" aria-hidden="true">
              <div className="hero-blob hero-blob-1" />
              <div className="hero-blob hero-blob-2" />
              <div className="hero-grade-pontos" />

              {teaser && IconeTeaser && (
                <div className="hero-preview-card hero-preview-card-back">
                  <span className="hero-preview-icone">
                    <IconeTeaser size={18} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="hero-preview-titulo">{teaser.nome}</p>
                    <p className="hero-preview-sub">Em breve</p>
                  </div>
                </div>
              )}

              {destaque && IconeMeuLixo && (
                <div className="hero-preview-card hero-preview-card-front">
                  <span className="hero-preview-icone">
                    <IconeMeuLixo size={20} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="hero-preview-titulo">{destaque.nome}</p>
                    <p className="hero-preview-sub">Próxima coleta: 06:30 · Centro</p>
                  </div>
                  <span className="hero-preview-status">
                    <span className="hero-preview-status-dot" aria-hidden="true" />
                    Ativo
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="portal-secao">
        <div className="portal-secao-inner">
          <div
            ref={beneficiosReveal.ref}
            className={`portal-beneficios reveal ${beneficiosReveal.visivel ? 'reveal-visivel' : ''}`}
          >
            {BENEFICIOS.map((b) => (
              <div key={b.titulo} className="portal-beneficio">
                <span className="portal-beneficio-icone" aria-hidden="true">
                  <b.Icone size={22} strokeWidth={2} />
                </span>
                <div>
                  <p className="portal-beneficio-titulo">{b.titulo}</p>
                  <p className="nota">{b.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="portal-secao portal-secao-tintada" id="servicos">
        <div className="portal-secao-inner">
          <header className="portal-secao-header">
            <span className="eyebrow">Explore</span>
            <h2>Serviços do município</h2>
            <p>Acesse rapidamente qualquer serviço disponível ou acompanhe os que estão a caminho.</p>
          </header>

          {servicosFiltrados.length === 0 ? (
            <p className="portal-sem-resultado">Nenhum serviço encontrado para "{busca}".</p>
          ) : (
            <div className="portal-grid">
              {servicosFiltrados.map((s, i) => (
                <ServicoCard key={s.id} servico={s} indice={i} onNavegar={onNavegar} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
