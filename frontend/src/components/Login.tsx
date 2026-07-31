import { useEffect, useState, type FormEvent } from 'react'
import {
  atualizarBairro,
  atualizarCaminhao,
  atualizarMotorista,
  atualizarPontoColeta,
  buscarAdminAtual,
  buscarBairros,
  buscarCaminhoes,
  buscarMotoristasAdmin,
  buscarPontosColeta,
  criarBairro,
  criarCaminhao,
  criarMotorista,
  criarPontoColeta,
  excluirBairro,
  excluirCaminhao,
  excluirMotorista,
  excluirPontoColeta,
  loginAdmin,
  loginMotorista,
  logoutAdmin,
  type AdminLogado,
  type Bairro,
  type Caminhao,
  type Motorista,
  type MotoristaLogado,
  type PontoColeta,
  type TipoResiduo,
} from '../api'

const CHAVE_MOTORISTA = 'ecomais_motorista'
const CHAVE_ADMIN = 'ecomais_admin'
const DIAS_SEMANA: { valor: string; label: string }[] = [
  { valor: 'seg', label: 'Seg' },
  { valor: 'ter', label: 'Ter' },
  { valor: 'qua', label: 'Qua' },
  { valor: 'qui', label: 'Qui' },
  { valor: 'sex', label: 'Sex' },
  { valor: 'sab', label: 'Sáb' },
  { valor: 'dom', label: 'Dom' },
]

interface SessaoAdmin {
  token: string
  admin: AdminLogado
}

function carregar<T>(chave: string): T | null {
  const bruto = localStorage.getItem(chave)
  if (!bruto) return null
  try {
    return JSON.parse(bruto) as T
  } catch {
    return null
  }
}

export default function Login() {
  const [motorista, setMotorista] = useState<MotoristaLogado | null>(() => carregar(CHAVE_MOTORISTA))
  const [sessaoAdmin, setSessaoAdmin] = useState<SessaoAdmin | null>(() => carregar(CHAVE_ADMIN))
  const [verificando, setVerificando] = useState(true)
  const [secao, setSecao] = useState<'bairros' | 'pontos' | 'motoristas' | 'caminhoes'>('bairros')

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Ao montar, confirma que o token de admin salvo ainda é válido (servidor pode ter reiniciado).
  useEffect(() => {
    if (!sessaoAdmin) {
      setVerificando(false)
      return
    }
    buscarAdminAtual(sessaoAdmin.token)
      .then(() => setVerificando(false))
      .catch(() => {
        setSessaoAdmin(null)
        localStorage.removeItem(CHAVE_ADMIN)
        setVerificando(false)
      })
  }, [])

  useEffect(() => {
    if (motorista) localStorage.setItem(CHAVE_MOTORISTA, JSON.stringify(motorista))
    else localStorage.removeItem(CHAVE_MOTORISTA)
  }, [motorista])

  useEffect(() => {
    if (sessaoAdmin) localStorage.setItem(CHAVE_ADMIN, JSON.stringify(sessaoAdmin))
    else localStorage.removeItem(CHAVE_ADMIN)
  }, [sessaoAdmin])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setCarregando(true)
    try {
      const dadosMotorista = await loginMotorista(email, senha)
      setMotorista(dadosMotorista)
      setSenha('')
    } catch {
      try {
        const dadosAdmin = await loginAdmin(email, senha)
        setSessaoAdmin(dadosAdmin)
        setSenha('')
      } catch {
        setErro('E-mail ou senha inválidos.')
      }
    } finally {
      setCarregando(false)
    }
  }

  async function sairMotorista() {
    setMotorista(null)
  }

  async function sairAdmin() {
    if (sessaoAdmin) await logoutAdmin(sessaoAdmin.token).catch(() => {})
    setSessaoAdmin(null)
  }

  if (verificando) {
    return (
      <section className="tela">
        <p className="aviso">Verificando sessão…</p>
      </section>
    )
  }

  // ---- Sessão de motorista ----
  if (motorista) {
    return (
      <section className="tela">
        <header className="tela-header">
          <span className="eyebrow">Área do motorista</span>
          <h1>Olá, {motorista.nome.split(' ')[0]}</h1>
        </header>

        <div className="card-destaque card-destaque-motorista">
          <span className="card-destaque-hora" style={{ fontSize: '1.4rem' }}>
            {motorista.caminhao ? motorista.caminhao.identificador : 'Sem caminhão vinculado'}
          </span>
          <p>{motorista.email}</p>
        </div>

        <p className="nota">
          * Sessão ativa neste dispositivo. É essa sessão que, no próximo passo, vai
          autorizar o celular do motorista a enviar a localização em tempo real
          para <code>posicoes_gps</code>.
        </p>

        <button className="botao botao-secundario" onClick={sairMotorista}>
          Sair
        </button>
      </section>
    )
  }

  // ---- Sessão de admin ----
  if (sessaoAdmin) {
    return (
      <section className="tela">
        <header className="tela-header">
          <span className="eyebrow">Painel administrativo</span>
          <h1>Olá, {sessaoAdmin.admin.nome.split(' ')[0]}</h1>
        </header>

        <div className="filtro-chip-linha">
          <button className={`chip ${secao === 'bairros' ? 'chip-ativo' : ''}`} onClick={() => setSecao('bairros')}>
            Bairros
          </button>
          <button className={`chip ${secao === 'pontos' ? 'chip-ativo' : ''}`} onClick={() => setSecao('pontos')}>
            Pontos
          </button>
          <button
            className={`chip ${secao === 'motoristas' ? 'chip-ativo' : ''}`}
            onClick={() => setSecao('motoristas')}
          >
            Motoristas
          </button>
          <button
            className={`chip ${secao === 'caminhoes' ? 'chip-ativo' : ''}`}
            onClick={() => setSecao('caminhoes')}
          >
            Caminhões
          </button>
        </div>

        {secao === 'bairros' && <AdminBairros token={sessaoAdmin.token} />}
        {secao === 'pontos' && <AdminPontos token={sessaoAdmin.token} />}
        {secao === 'motoristas' && <AdminMotoristas token={sessaoAdmin.token} />}
        {secao === 'caminhoes' && <AdminCaminhoes token={sessaoAdmin.token} />}

        <button className="botao botao-secundario" onClick={sairAdmin}>
          Sair do painel
        </button>
      </section>
    )
  }

  // ---- Formulário único de login ----
  return (
    <section className="tela">
      <header className="tela-header">
        <span className="eyebrow">Entrar</span>
        <h1>Acesse sua conta</h1>
      </header>

      <form className="form-login" onSubmit={handleSubmit}>
        <label className="campo">
          <span>E-mail</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="campo">
          <span>Senha</span>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </label>

        {erro && <p className="aviso aviso-erro">{erro}</p>}

        <button className="botao" type="submit" disabled={carregando}>
          {carregando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="nota">
        * Login demo — motorista: <strong>joao@ecomais.com</strong> ou{' '}
        <strong>maria@ecomais.com</strong>, senha <strong>motorista123</strong>. Admin:{' '}
        <strong>admin@ecomais.com</strong>, senha <strong>ecomais123</strong>.
      </p>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Bairros
// ---------------------------------------------------------------------------

const BAIRRO_VAZIO = { nome: '', dias: [] as string[], horarioPrevisto: '07:00' }

function AdminBairros({ token }: { token: string }) {
  const [bairros, setBairros] = useState<Bairro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState(BAIRRO_VAZIO)

  function recarregar() {
    setCarregando(true)
    buscarBairros()
      .then(setBairros)
      .catch(() => setErro('Não foi possível carregar os bairros.'))
      .finally(() => setCarregando(false))
  }

  useEffect(recarregar, [])

  function editar(b: Bairro) {
    setEditandoId(b.id)
    setForm({ nome: b.nome, dias: b.diasColeta, horarioPrevisto: b.horarioPrevisto.slice(0, 5) })
  }

  function cancelar() {
    setEditandoId(null)
    setForm(BAIRRO_VAZIO)
  }

  function alternarDia(dia: string) {
    setForm((f) => ({
      ...f,
      dias: f.dias.includes(dia) ? f.dias.filter((d) => d !== dia) : [...f.dias, dia],
    }))
  }

  async function salvar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    const dados = { nome: form.nome, diasColeta: form.dias, horarioPrevisto: form.horarioPrevisto }
    try {
      if (editandoId) {
        await atualizarBairro(token, editandoId, dados)
      } else {
        await criarBairro(token, dados)
      }
      cancelar()
      recarregar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar o bairro.')
    }
  }

  async function remover(id: string) {
    if (!confirm('Excluir este bairro? Os pontos de coleta vinculados também serão excluídos.')) return
    try {
      await excluirBairro(token, id)
      recarregar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível excluir o bairro.')
    }
  }

  return (
    <div className="admin-secao">
      {erro && <p className="aviso aviso-erro">{erro}</p>}

      {carregando ? (
        <p className="aviso">Carregando…</p>
      ) : (
        <ul className="lista-admin">
          {bairros.map((b) => (
            <li key={b.id} className="item-admin">
              <div>
                <strong>{b.nome}</strong>
                <p className="nota">
                  {b.diasColeta.join(', ')} às {b.horarioPrevisto.slice(0, 5)}
                </p>
              </div>
              <div className="acoes-admin">
                <button className="botao-link" onClick={() => editar(b)}>
                  Editar
                </button>
                <button className="botao-link botao-link-perigo" onClick={() => remover(b.id)}>
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="form-login" onSubmit={salvar}>
        <h2 className="form-titulo">{editandoId ? 'Editar bairro' : 'Novo bairro'}</h2>
        <label className="campo">
          <span>Nome</span>
          <input
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            required
          />
        </label>

        <label className="campo">
          <span>Dias de coleta</span>
          <div className="dias-semana">
            {DIAS_SEMANA.map((d) => (
              <button
                type="button"
                key={d.valor}
                className={`chip chip-dia ${form.dias.includes(d.valor) ? 'chip-ativo' : ''}`}
                onClick={() => alternarDia(d.valor)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </label>

        <label className="campo">
          <span>Horário previsto</span>
          <input
            type="time"
            value={form.horarioPrevisto}
            onChange={(e) => setForm((f) => ({ ...f, horarioPrevisto: e.target.value }))}
            required
          />
        </label>

        <div className="acoes-admin">
          <button className="botao" type="submit">
            {editandoId ? 'Salvar alterações' : 'Adicionar bairro'}
          </button>
          {editandoId && (
            <button type="button" className="botao botao-secundario" onClick={cancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pontos de coleta
// ---------------------------------------------------------------------------

const PONTO_VAZIO = { nome: '', latitude: '', longitude: '', tipoResiduo: 'reciclavel' as TipoResiduo, bairroId: '' }

function AdminPontos({ token }: { token: string }) {
  const [pontos, setPontos] = useState<PontoColeta[]>([])
  const [bairros, setBairros] = useState<Bairro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState(PONTO_VAZIO)

  function recarregar() {
    setCarregando(true)
    Promise.all([buscarPontosColeta(), buscarBairros()])
      .then(([p, b]) => {
        setPontos(p)
        setBairros(b)
        setForm((f) => (f.bairroId ? f : { ...f, bairroId: b[0]?.id ?? '' }))
      })
      .catch(() => setErro('Não foi possível carregar os pontos de coleta.'))
      .finally(() => setCarregando(false))
  }

  useEffect(recarregar, [])

  function editar(p: PontoColeta) {
    setEditandoId(p.id)
    setForm({ nome: p.nome, latitude: p.latitude, longitude: p.longitude, tipoResiduo: p.tipoResiduo, bairroId: p.bairroId })
  }

  function cancelar() {
    setEditandoId(null)
    setForm({ ...PONTO_VAZIO, bairroId: bairros[0]?.id ?? '' })
  }

  async function salvar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    const dados = {
      nome: form.nome,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      tipoResiduo: form.tipoResiduo,
      bairroId: form.bairroId,
    }
    try {
      if (editandoId) {
        await atualizarPontoColeta(token, editandoId, dados)
      } else {
        await criarPontoColeta(token, dados)
      }
      cancelar()
      recarregar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar o ponto de coleta.')
    }
  }

  async function remover(id: string) {
    if (!confirm('Excluir este ponto de coleta?')) return
    try {
      await excluirPontoColeta(token, id)
      recarregar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível excluir o ponto de coleta.')
    }
  }

  return (
    <div className="admin-secao">
      {erro && <p className="aviso aviso-erro">{erro}</p>}

      {carregando ? (
        <p className="aviso">Carregando…</p>
      ) : (
        <ul className="lista-admin">
          {pontos.map((p) => (
            <li key={p.id} className="item-admin">
              <div>
                <strong>{p.nome}</strong>
                <p className="nota">
                  {p.bairroNome} · {p.tipoResiduo}
                </p>
              </div>
              <div className="acoes-admin">
                <button className="botao-link" onClick={() => editar(p)}>
                  Editar
                </button>
                <button className="botao-link botao-link-perigo" onClick={() => remover(p.id)}>
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="form-login" onSubmit={salvar}>
        <h2 className="form-titulo">{editandoId ? 'Editar ponto de coleta' : 'Novo ponto de coleta'}</h2>
        <label className="campo">
          <span>Nome</span>
          <input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} required />
        </label>

        <label className="campo">
          <span>Latitude</span>
          <input
            type="number"
            step="any"
            value={form.latitude}
            onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
            required
          />
        </label>

        <label className="campo">
          <span>Longitude</span>
          <input
            type="number"
            step="any"
            value={form.longitude}
            onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
            required
          />
        </label>

        <label className="campo">
          <span>Tipo de resíduo</span>
          <select
            value={form.tipoResiduo}
            onChange={(e) => setForm((f) => ({ ...f, tipoResiduo: e.target.value as TipoResiduo }))}
          >
            <option value="reciclavel">Reciclável</option>
            <option value="organico">Orgânico</option>
            <option value="geral">Geral</option>
          </select>
        </label>

        <label className="campo">
          <span>Bairro</span>
          <select value={form.bairroId} onChange={(e) => setForm((f) => ({ ...f, bairroId: e.target.value }))}>
            {bairros.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nome}
              </option>
            ))}
          </select>
        </label>

        <div className="acoes-admin">
          <button className="botao" type="submit">
            {editandoId ? 'Salvar alterações' : 'Adicionar ponto'}
          </button>
          {editandoId && (
            <button type="button" className="botao botao-secundario" onClick={cancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Motoristas
// ---------------------------------------------------------------------------

const MOTORISTA_VAZIO = { nome: '', telefone: '', email: '', senha: '', ativo: true }

function AdminMotoristas({ token }: { token: string }) {
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState(MOTORISTA_VAZIO)

  function recarregar() {
    setCarregando(true)
    buscarMotoristasAdmin(token)
      .then(setMotoristas)
      .catch(() => setErro('Não foi possível carregar os motoristas.'))
      .finally(() => setCarregando(false))
  }

  useEffect(recarregar, [])

  function editar(m: Motorista) {
    setEditandoId(m.id)
    setForm({ nome: m.nome, telefone: m.telefone ?? '', email: m.email, senha: '', ativo: m.ativo })
  }

  function cancelar() {
    setEditandoId(null)
    setForm(MOTORISTA_VAZIO)
  }

  async function salvar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    try {
      if (editandoId) {
        await atualizarMotorista(token, editandoId, form)
      } else {
        if (!form.senha) {
          setErro('Informe uma senha para o novo motorista.')
          return
        }
        await criarMotorista(token, form)
      }
      cancelar()
      recarregar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar o motorista.')
    }
  }

  async function remover(id: string) {
    if (!confirm('Excluir este motorista?')) return
    try {
      await excluirMotorista(token, id)
      recarregar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível excluir o motorista.')
    }
  }

  return (
    <div className="admin-secao">
      {erro && <p className="aviso aviso-erro">{erro}</p>}

      {carregando ? (
        <p className="aviso">Carregando…</p>
      ) : (
        <ul className="lista-admin">
          {motoristas.map((m) => (
            <li key={m.id} className="item-admin">
              <div>
                <strong>{m.nome}</strong>
                <p className="nota">
                  {m.email} · {m.telefone || 'sem telefone'} · {m.ativo ? 'ativo' : 'inativo'}
                </p>
              </div>
              <div className="acoes-admin">
                <button className="botao-link" onClick={() => editar(m)}>
                  Editar
                </button>
                <button className="botao-link botao-link-perigo" onClick={() => remover(m.id)}>
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="form-login" onSubmit={salvar}>
        <h2 className="form-titulo">{editandoId ? 'Editar motorista' : 'Novo motorista'}</h2>
        <label className="campo">
          <span>Nome</span>
          <input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} required />
        </label>

        <label className="campo">
          <span>Telefone</span>
          <input value={form.telefone} onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))} />
        </label>

        <label className="campo">
          <span>E-mail</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
        </label>

        <label className="campo">
          <span>{editandoId ? 'Nova senha (deixe em branco para manter)' : 'Senha'}</span>
          <input type="password" value={form.senha} onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))} />
        </label>

        <label className="campo campo-checkbox">
          <input
            type="checkbox"
            checked={form.ativo}
            onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
          />
          <span>Ativo</span>
        </label>

        <div className="acoes-admin">
          <button className="botao" type="submit">
            {editandoId ? 'Salvar alterações' : 'Adicionar motorista'}
          </button>
          {editandoId && (
            <button type="button" className="botao botao-secundario" onClick={cancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Caminhões
// ---------------------------------------------------------------------------

const CAMINHAO_VAZIO = { identificador: '', motoristaId: '', bairroId: '', ativo: true }

function AdminCaminhoes({ token }: { token: string }) {
  const [caminhoes, setCaminhoes] = useState<Caminhao[]>([])
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [bairros, setBairros] = useState<Bairro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState(CAMINHAO_VAZIO)

  function recarregar() {
    setCarregando(true)
    Promise.all([buscarCaminhoes(token), buscarMotoristasAdmin(token), buscarBairros()])
      .then(([c, m, b]) => {
        setCaminhoes(c)
        setMotoristas(m)
        setBairros(b)
      })
      .catch(() => setErro('Não foi possível carregar os caminhões.'))
      .finally(() => setCarregando(false))
  }

  useEffect(recarregar, [])

  function editar(c: Caminhao) {
    setEditandoId(c.id)
    setForm({
      identificador: c.identificador,
      motoristaId: c.motoristaId ?? '',
      bairroId: c.bairroId ?? '',
      ativo: c.ativo,
    })
  }

  function cancelar() {
    setEditandoId(null)
    setForm(CAMINHAO_VAZIO)
  }

  async function salvar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    const dados = {
      identificador: form.identificador,
      motoristaId: form.motoristaId || null,
      bairroId: form.bairroId || null,
      ativo: form.ativo,
    }
    try {
      if (editandoId) {
        await atualizarCaminhao(token, editandoId, dados)
      } else {
        await criarCaminhao(token, dados)
      }
      cancelar()
      recarregar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar o caminhão.')
    }
  }

  async function remover(id: string) {
    if (!confirm('Excluir este caminhão?')) return
    try {
      await excluirCaminhao(token, id)
      recarregar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível excluir o caminhão.')
    }
  }

  return (
    <div className="admin-secao">
      {erro && <p className="aviso aviso-erro">{erro}</p>}

      {carregando ? (
        <p className="aviso">Carregando…</p>
      ) : (
        <ul className="lista-admin">
          {caminhoes.map((c) => (
            <li key={c.id} className="item-admin">
              <div>
                <strong>{c.identificador}</strong>
                <p className="nota">
                  {c.motoristaNome ?? 'sem motorista'} · {c.bairroNome ?? 'sem rota'} · {c.ativo ? 'ativo' : 'inativo'}
                </p>
              </div>
              <div className="acoes-admin">
                <button className="botao-link" onClick={() => editar(c)}>
                  Editar
                </button>
                <button className="botao-link botao-link-perigo" onClick={() => remover(c.id)}>
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="form-login" onSubmit={salvar}>
        <h2 className="form-titulo">{editandoId ? 'Editar caminhão' : 'Novo caminhão'}</h2>
        <label className="campo">
          <span>Identificador (placa)</span>
          <input
            value={form.identificador}
            onChange={(e) => setForm((f) => ({ ...f, identificador: e.target.value }))}
            required
          />
        </label>

        <label className="campo">
          <span>Motorista</span>
          <select
            value={form.motoristaId}
            onChange={(e) => setForm((f) => ({ ...f, motoristaId: e.target.value }))}
          >
            <option value="">Sem motorista</option>
            {motoristas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="campo">
          <span>Rota / bairro</span>
          <select value={form.bairroId} onChange={(e) => setForm((f) => ({ ...f, bairroId: e.target.value }))}>
            <option value="">Sem rota</option>
            {bairros.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="campo campo-checkbox">
          <input
            type="checkbox"
            checked={form.ativo}
            onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
          />
          <span>Ativo</span>
        </label>

        <div className="acoes-admin">
          <button className="botao" type="submit">
            {editandoId ? 'Salvar alterações' : 'Adicionar caminhão'}
          </button>
          {editandoId && (
            <button type="button" className="botao botao-secundario" onClick={cancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
