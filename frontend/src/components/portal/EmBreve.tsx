import type { ServicoPortal } from '../../api'

export default function EmBreve({ servico, aoVoltar }: { servico: ServicoPortal; aoVoltar: () => void }) {
  return (
    <div className="portal-conteudo portal-em-breve">
      <span className="portal-card-emoji" aria-hidden="true">
        {servico.emoji}
      </span>
      <h1>{servico.nome} está a caminho</h1>
      <p>{servico.descricao}</p>
      <p className="nota">Essa área ainda está sendo construída pela prefeitura. Volte em breve!</p>
      <button className="botao" onClick={aoVoltar}>
        Voltar para Sua Cidade
      </button>
    </div>
  )
}
