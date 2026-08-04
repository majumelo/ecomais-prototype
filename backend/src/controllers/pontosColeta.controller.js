import { pool } from '../config/db.js'

// US2.1 — pontos de coleta para o mapa interativo (filtro opcional por tipo)
export async function listar(req, res) {
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
}

export async function criar(req, res) {
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
}

export async function atualizar(req, res) {
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
}

export async function excluir(req, res) {
  try {
    await pool.query('DELETE FROM pontos_coleta WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível excluir o ponto de coleta.' })
  }
}
