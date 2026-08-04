import { pool } from '../config/db.js'

// US3.2 — login do motorista (abre caminho para o app dele enviar GPS ao vivo)
export async function login(req, res) {
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
}

// Painel admin — motoristas
export async function listar(_req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, nome, telefone, email, ativo FROM motoristas ORDER BY nome`,
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível buscar os motoristas.' })
  }
}

export async function criar(req, res) {
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
}

export async function atualizar(req, res) {
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
}

export async function excluir(req, res) {
  try {
    await pool.query('DELETE FROM motoristas WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível excluir o motorista.' })
  }
}
