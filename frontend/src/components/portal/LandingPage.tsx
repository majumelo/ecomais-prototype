import type { ServicoPortal } from '../../api'

export default function LandingPage({
  servicos,
  onNavegar,
}: {
  servicos: ServicoPortal[]
  onNavegar: (secao: string) => void
}) {
  return (
    <div className="portal-conteudo">
      <section className="portal-hero">
        <span className="eyebrow">Portal do município</span>
        <h1>Os serviços da sua cidade, num só lugar</h1>
        <p>Acompanhe a coleta de lixo, a escola, a saúde e a cidadania sem sair de casa.</p>
      </section>

      <div className="portal-grid">
        {servicos.map((s) => (
          <button key={s.id} className="portal-card" onClick={() => onNavegar(s.id)}>
            <span className="portal-card-emoji" aria-hidden="true">
              {s.emoji}
            </span>
            <span className="portal-card-titulo">{s.nome}</span>
            <p className="portal-card-descricao">{s.descricao}</p>
            <span className={`portal-badge ${s.disponivel ? 'portal-badge-ativo' : ''}`}>
              {s.disponivel ? 'Disponível' : 'Em breve'}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
