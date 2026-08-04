import { pool } from '../config/db.js'

// Landing page "Sua Cidade" — cards de serviço (Meu Lixo, Minha Educação...)
export async function listar(_req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, nome, emoji, descricao, disponivel
       FROM servicos_portal
       ORDER BY ordem`,
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível buscar os serviços do portal.' })
  }
}

export async function criar(req, res) {
  const { id, nome, emoji, descricao, disponivel, ordem } = req.body ?? {}
  if (!id || !nome || !emoji || !descricao) {
    return res.status(400).json({ erro: 'Informe id, nome, emoji e descrição.' })
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO servicos_portal (id, nome, emoji, descricao, disponivel, ordem)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nome, emoji, descricao, disponivel`,
      [id, nome, emoji, descricao, disponivel ?? false, ordem ?? 0],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    if (err.code === '23505') return res.status(409).json({ erro: 'Já existe um serviço com esse id.' })
    res.status(500).json({ erro: 'Não foi possível criar o serviço.' })
  }
}

export async function atualizar(req, res) {
  const { nome, emoji, descricao, disponivel, ordem } = req.body ?? {}
  if (!nome || !emoji || !descricao) {
    return res.status(400).json({ erro: 'Informe nome, emoji e descrição.' })
  }
  try {
    const { rows } = await pool.query(
      `UPDATE servicos_portal SET nome = $1, emoji = $2, descricao = $3, disponivel = $4, ordem = $5
       WHERE id = $6
       RETURNING id, nome, emoji, descricao, disponivel`,
      [nome, emoji, descricao, disponivel ?? false, ordem ?? 0, req.params.id],
    )
    if (rows.length === 0) return res.status(404).json({ erro: 'Serviço não encontrado.' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível atualizar o serviço.' })
  }
}

export async function excluir(req, res) {
  try {
    await pool.query('DELETE FROM servicos_portal WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível excluir o serviço.' })
  }
}
