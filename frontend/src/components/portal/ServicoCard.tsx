import { ArrowUpRight } from 'lucide-react'
import type { ServicoPortal } from '../../api'
import { iconeDoServico } from '../../servicoIcones'
import { useReveal } from '../../hooks/useReveal'

export default function ServicoCard({
  servico,
  indice,
  onNavegar,
}: {
  servico: ServicoPortal
  indice: number
  onNavegar: (secao: string) => void
}) {
  const { ref, visivel } = useReveal<HTMLButtonElement>()
  const Icone = iconeDoServico(servico.id)

  return (
    <button
      ref={ref}
      className={`portal-card reveal ${visivel ? 'reveal-visivel' : ''}`}
      style={{ transitionDelay: visivel ? `${Math.min(indice, 4) * 70}ms` : undefined }}
      onClick={() => onNavegar(servico.id)}
    >
      <span className="portal-card-icone" aria-hidden="true">
        <Icone size={22} strokeWidth={2} />
      </span>
      <span className="portal-card-titulo">{servico.nome}</span>
      <p className="portal-card-descricao">{servico.descricao}</p>
      <span className="portal-card-rodape">
        <span className={`portal-badge ${servico.disponivel ? 'portal-badge-ativo' : ''}`}>
          {servico.disponivel ? 'Disponível' : 'Em breve'}
        </span>
        <ArrowUpRight size={18} className="portal-card-seta" aria-hidden="true" />
      </span>
    </button>
  )
}
