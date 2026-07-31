import { useEffect, useMemo, useState } from 'react'
import { buscarBairros, type Bairro } from '../api'

export default function HorarioColeta() {
  const [bairros, setBairros] = useState<Bairro[]>([])
  const [bairroId, setBairroId] = useState<string>('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    buscarBairros()
      .then((dados) => {
        setBairros(dados)
        setBairroId(dados[0]?.id ?? '')
      })
      .catch(() => setErro('Não foi possível carregar os bairros. Verifique se o backend (backend/) está rodando.'))
      .finally(() => setCarregando(false))
  }, [])

  const bairro = useMemo(() => bairros.find((b) => b.id === bairroId), [bairros, bairroId])

  return (
    <section className="tela">
      <header className="tela-header">
        <span className="eyebrow">Horário de coleta</span>
        <h1>Que horas a coleta chega no seu bairro?</h1>
      </header>

      {carregando && <p className="aviso">Carregando bairros…</p>}
      {erro && <p className="aviso">{erro}</p>}

      {!carregando && !erro && (
        <>
          <label className="campo">
            <span>Selecione seu bairro</span>
            <select value={bairroId} onChange={(e) => setBairroId(e.target.value)}>
              {bairros.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome}
                </option>
              ))}
            </select>
          </label>

          {bairro ? (
            <div className="card-destaque">
              <span className="card-destaque-hora">{bairro.horarioPrevisto.slice(0, 5)}</span>
              <p>
                Coleta prevista em <strong>{bairro.diasColeta.join(', ')}</strong>
              </p>
            </div>
          ) : (
            <p className="aviso">Ainda não há horário cadastrado para este bairro.</p>
          )}
        </>
      )}

      <p className="nota">
        * Horário pode variar em feriados. Acompanhe o caminhão ao vivo na aba
        "Caminhão" para saber a posição em tempo real.
      </p>
    </section>
  )
}
