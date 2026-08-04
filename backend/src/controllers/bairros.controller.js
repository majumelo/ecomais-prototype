import { pool } from '../config/db.js'

// US1.1 — horário de coleta por bairro
export async function listar(_req, res) {
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
}

export async function criar(req, res) {
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
}

export async function atualizar(req, res) {
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
}

export async function excluir(req, res) {
  try {
    await pool.query('DELETE FROM bairros WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível excluir o bairro.' })
  }
}
