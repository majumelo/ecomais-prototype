import { ArrowLeft } from 'lucide-react'
import type { ServicoPortal } from '../../api'
import { iconeDoServico } from '../../servicoIcones'

export default function EmBreve({ servico, aoVoltar }: { servico: ServicoPortal; aoVoltar: () => void }) {
  const Icone = iconeDoServico(servico.id)

  return (
    <div className="portal-conteudo portal-em-breve">
      <span className="portal-em-breve-icone" aria-hidden="true">
        <Icone size={32} strokeWidth={1.8} />
      </span>
      <h1>{servico.nome} está a caminho</h1>
      <p>{servico.descricao}</p>
      <p className="nota">Essa área ainda está sendo construída pela prefeitura. Volte em breve!</p>
      <button className="botao" onClick={aoVoltar}>
        <ArrowLeft size={17} />
        Voltar para Sua Cidade
      </button>
    </div>
  )
}
