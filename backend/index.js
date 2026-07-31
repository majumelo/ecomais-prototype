import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { randomUUID } from 'crypto'
import { pool } from './db.js'

const app = express()
app.use(cors())
app.use(express.json())

// Sessões de admin em memória (protótipo): token -> { id, nome, email }.
// Reinicia ao reiniciar o servidor — para produção, trocar por JWT.
const adminTokens = new Map()

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  const admin = token && adminTokens.get(token)
  if (!admin) {
    return res.status(401).json({ erro: 'Não autenticado.' })
  }
  req.admin = admin
  next()
}

// Healthcheck simples
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// US1.1 — horário de coleta por bairro
app.get('/api/bairros', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nome, dias_coleta::text[] AS "diasColeta", horario_previsto AS "horarioPrevisto"
       FROM bairros
       ORDER BY nome`,
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível buscar os bairros.' })
  }
})

app.post('/api/bairros', requireAdmin, async (req, res) => {
  const { nome, diasColeta, horarioPrevisto } = req.body ?? {}
  if (!nome || !Array.isArray(diasColeta) || diasColeta.length === 0 || !horarioPrevisto) {
    return res.status(400).json({ erro: 'Informe nome, diasColeta e horarioPrevisto.' })
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO bairros (nome, dias_coleta, horario_previsto)
       VALUES ($1, $2::dia_semana[], $3)
       RETURNING id, nome, dias_coleta::text[] AS "diasColeta", horario_previsto AS "horarioPrevisto"`,
      [nome, diasColeta, horarioPrevisto],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    if (err.code === '23505') return res.status(409).json({ erro: 'Já existe um bairro com esse nome.' })
    res.status(500).json({ erro: 'Não foi possível criar o bairro.' })
  }
})

app.put('/api/bairros/:id', requireAdmin, async (req, res) => {
  const { nome, diasColeta, horarioPrevisto } = req.body ?? {}
  if (!nome || !Array.isArray(diasColeta) || diasColeta.length === 0 || !horarioPrevisto) {
    return res.status(400).json({ erro: 'Informe nome, diasColeta e horarioPrevisto.' })
  }
  try {
    const { rows } = await pool.query(
      `UPDATE bairros SET nome = $1, dias_coleta = $2::dia_semana[], horario_previsto = $3
       WHERE id = $4
       RETURNING id, nome, dias_coleta::text[] AS "diasColeta", horario_previsto AS "horarioPrevisto"`,
      [nome, diasColeta, horarioPrevisto, req.params.id],
    )
    if (rows.length === 0) return res.status(404).json({ erro: 'Bairro não encontrado.' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível atualizar o bairro.' })
  }
})

app.delete('/api/bairros/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM bairros WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível excluir o bairro.' })
  }
})

// US2.1 — pontos de coleta para o mapa interativo (filtro opcional por tipo)
app.get('/api/pontos-coleta', async (req, res) => {
  const { tipo } = req.query
  try {
    const params = []
    let where = ''
    if (tipo && tipo !== 'todos') {
      params.push(tipo)
      where = 'WHERE p.tipo_residuo = $1'
    }
    const { rows } = await pool.query(
      `SELECT p.id, p.nome, p.latitude, p.longitude, p.tipo_residuo AS "tipoResiduo",
              p.bairro_id AS "bairroId", b.nome AS "bairroNome"
       FROM pontos_coleta p
       JOIN bairros b ON b.id = p.bairro_id
       ${where}
       ORDER BY p.nome`,
      params,
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível buscar os pontos de coleta.' })
  }
})

app.post('/api/pontos-coleta', requireAdmin, async (req, res) => {
  const { nome, latitude, longitude, tipoResiduo, bairroId } = req.body ?? {}
  if (!nome || latitude == null || longitude == null || !tipoResiduo || !bairroId) {
    return res.status(400).json({ erro: 'Informe nome, latitude, longitude, tipoResiduo e bairroId.' })
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO pontos_coleta (nome, latitude, longitude, tipo_residuo, bairro_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome, latitude, longitude, tipo_residuo AS "tipoResiduo", bairro_id AS "bairroId"`,
      [nome, latitude, longitude, tipoResiduo, bairroId],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível criar o ponto de coleta.' })
  }
})

app.put('/api/pontos-coleta/:id', requireAdmin, async (req, res) => {
  const { nome, latitude, longitude, tipoResiduo, bairroId } = req.body ?? {}
  if (!nome || latitude == null || longitude == null || !tipoResiduo || !bairroId) {
    return res.status(400).json({ erro: 'Informe nome, latitude, longitude, tipoResiduo e bairroId.' })
  }
  try {
    const { rows } = await pool.query(
      `UPDATE pontos_coleta SET nome = $1, latitude = $2, longitude = $3, tipo_residuo = $4, bairro_id = $5
       WHERE id = $6
       RETURNING id, nome, latitude, longitude, tipo_residuo AS "tipoResiduo", bairro_id AS "bairroId"`,
      [nome, latitude, longitude, tipoResiduo, bairroId, req.params.id],
    )
    if (rows.length === 0) return res.status(404).json({ erro: 'Ponto de coleta não encontrado.' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível atualizar o ponto de coleta.' })
  }
})

app.delete('/api/pontos-coleta/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM pontos_coleta WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível excluir o ponto de coleta.' })
  }
})

// US3.1 — última posição conhecida de cada caminhão (GPS ao vivo)
app.get('/api/caminhoes/posicoes', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT caminhao_id AS "caminhaoId", placa, bairro_id AS "bairroId",
              bairro_nome AS "bairroNome", latitude, longitude,
              registrado_em AS "atualizadoEm"
       FROM vw_ultima_posicao_caminhao
       ORDER BY placa`,
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível buscar a posição dos caminhões.' })
  }
})

// Painel admin — caminhões (cadastro/rota/motorista vinculado)
app.get('/api/caminhoes', requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.identificador, c.ativo,
              c.motorista_id AS "motoristaId", m.nome AS "motoristaNome",
              c.bairro_id AS "bairroId", b.nome AS "bairroNome"
       FROM caminhoes c
       LEFT JOIN motoristas m ON m.id = c.motorista_id
       LEFT JOIN bairros b ON b.id = c.bairro_id
       ORDER BY c.identificador`,
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível buscar os caminhões.' })
  }
})

app.post('/api/caminhoes', requireAdmin, async (req, res) => {
  const { identificador, motoristaId, bairroId, ativo } = req.body ?? {}
  if (!identificador) {
    return res.status(400).json({ erro: 'Informe o identificador (placa).' })
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO caminhoes (identificador, motorista_id, bairro_id, ativo)
       VALUES ($1, $2, $3, $4)
       RETURNING id, identificador, motorista_id AS "motoristaId", bairro_id AS "bairroId", ativo`,
      [identificador, motoristaId || null, bairroId || null, ativo ?? true],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    if (err.code === '23505') return res.status(409).json({ erro: 'Já existe um caminhão com esse identificador.' })
    res.status(500).json({ erro: 'Não foi possível criar o caminhão.' })
  }
})

app.put('/api/caminhoes/:id', requireAdmin, async (req, res) => {
  const { identificador, motoristaId, bairroId, ativo } = req.body ?? {}
  if (!identificador) {
    return res.status(400).json({ erro: 'Informe o identificador (placa).' })
  }
  try {
    const { rows } = await pool.query(
      `UPDATE caminhoes SET identificador = $1, motorista_id = $2, bairro_id = $3, ativo = $4
       WHERE id = $5
       RETURNING id, identificador, motorista_id AS "motoristaId", bairro_id AS "bairroId", ativo`,
      [identificador, motoristaId || null, bairroId || null, ativo ?? true, req.params.id],
    )
    if (rows.length === 0) return res.status(404).json({ erro: 'Caminhão não encontrado.' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    if (err.code === '23505') return res.status(409).json({ erro: 'Já existe um caminhão com esse identificador.' })
    res.status(500).json({ erro: 'Não foi possível atualizar o caminhão.' })
  }
})

app.delete('/api/caminhoes/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM caminhoes WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível excluir o caminhão.' })
  }
})

// US3.2 — login do motorista (abre caminho para o app dele enviar GPS ao vivo)
app.post('/api/motoristas/login', async (req, res) => {
  const { email, senha } = req.body ?? {}
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Informe e-mail e senha.' })
  }
  try {
    const { rows } = await pool.query(
      `SELECT m.id, m.nome, m.email, m.telefone,
              c.id AS "caminhaoId", c.identificador AS "caminhaoIdentificador"
       FROM motoristas m
       LEFT JOIN caminhoes c ON c.motorista_id = m.id AND c.ativo = true
       WHERE m.email = $1 AND m.ativo = true AND m.senha_hash = crypt($2, m.senha_hash)`,
      [email, senha],
    )
    if (rows.length === 0) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' })
    }
    const { id, nome, email: motoristaEmail, telefone, caminhaoId, caminhaoIdentificador } = rows[0]
    res.json({
      id,
      nome,
      email: motoristaEmail,
      telefone,
      caminhao: caminhaoId ? { id: caminhaoId, identificador: caminhaoIdentificador } : null,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível autenticar.' })
  }
})

// Painel admin — motoristas
app.get('/api/motoristas', requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nome, telefone, email, ativo FROM motoristas ORDER BY nome`,
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível buscar os motoristas.' })
  }
})

app.post('/api/motoristas', requireAdmin, async (req, res) => {
  const { nome, telefone, email, senha } = req.body ?? {}
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Informe nome, e-mail e senha.' })
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO motoristas (nome, telefone, email, senha_hash)
       VALUES ($1, $2, $3, crypt($4, gen_salt('bf')))
       RETURNING id, nome, telefone, email, ativo`,
      [nome, telefone || null, email, senha],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    if (err.code === '23505') return res.status(409).json({ erro: 'Já existe um motorista com esse e-mail.' })
    res.status(500).json({ erro: 'Não foi possível criar o motorista.' })
  }
})

app.put('/api/motoristas/:id', requireAdmin, async (req, res) => {
  const { nome, telefone, email, senha, ativo } = req.body ?? {}
  if (!nome || !email) {
    return res.status(400).json({ erro: 'Informe nome e e-mail.' })
  }
  try {
    const { rows } = await pool.query(
      `UPDATE motoristas
       SET nome = $1, telefone = $2, email = $3, ativo = $4,
           senha_hash = CASE WHEN $5::text IS NOT NULL AND $5 <> '' THEN crypt($5, gen_salt('bf')) ELSE senha_hash END
       WHERE id = $6
       RETURNING id, nome, telefone, email, ativo`,
      [nome, telefone || null, email, ativo ?? true, senha || null, req.params.id],
    )
    if (rows.length === 0) return res.status(404).json({ erro: 'Motorista não encontrado.' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    if (err.code === '23505') return res.status(409).json({ erro: 'Já existe um motorista com esse e-mail.' })
    res.status(500).json({ erro: 'Não foi possível atualizar o motorista.' })
  }
})

app.delete('/api/motoristas/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM motoristas WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível excluir o motorista.' })
  }
})

// Login/sessão do administrador (painel admin)
app.post('/api/administradores/login', async (req, res) => {
  const { email, senha } = req.body ?? {}
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Informe e-mail e senha.' })
  }
  try {
    const { rows } = await pool.query(
      `SELECT id, nome, email FROM administradores WHERE email = $1 AND senha_hash = crypt($2, senha_hash)`,
      [email, senha],
    )
    if (rows.length === 0) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' })
    }
    const admin = rows[0]
    const token = randomUUID()
    adminTokens.set(token, admin)
    res.json({ token, admin })
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível autenticar.' })
  }
})

app.get('/api/administradores/me', requireAdmin, (req, res) => {
  res.json(req.admin)
})

app.post('/api/administradores/logout', requireAdmin, (req, res) => {
  adminTokens.delete(req.headers.authorization.slice(7))
  res.status(204).end()
})

const port = process.env.PORT || 3333
app.listen(port, () => {
  console.log(`Ecomais API rodando em http://localhost:${port}`)
})
