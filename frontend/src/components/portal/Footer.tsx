import { Landmark } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="portal-footer">
      <div className="portal-footer-conteudo">
        <div>
          <span className="portal-marca-selo-footer" aria-hidden="true">
            <Landmark size={19} strokeWidth={2.2} />
          </span>
          <p className="portal-footer-titulo">Minha Cidade Virtual</p>
          <p className="nota">Portal oficial de serviços da Prefeitura Municipal de Cuité, Paraíba.</p>
        </div>
        <div>
          <p className="portal-footer-titulo">Serviços</p>
          <p className="nota">Meu Lixo · Minha Educação · Minha Saúde · Minha Cidadania</p>
        </div>
        <div>
          <p className="portal-footer-titulo">Contato</p>
          <p className="nota">Procure a Prefeitura de Cuité para dúvidas, sugestões ou suporte.</p>
        </div>
        <div>
          <p className="portal-footer-titulo">Sobre o portal</p>
          <p className="nota">Protótipo em desenvolvimento — novos serviços chegam aos poucos.</p>
        </div>
      </div>
      <p className="portal-footer-copy">Protótipo em desenvolvimento — dados de demonstração.</p>
    </footer>
  )
}
