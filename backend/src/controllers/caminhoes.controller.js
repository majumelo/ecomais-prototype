import { pool } from '../config/db.js'

// US3.1 — última posição conhecida de cada caminhão (GPS ao vivo)
export async function posicoes(_req, res) {
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
}

// Painel admin — caminhões (cadastro/rota/motorista vinculado)
export async function listar(_req, res) {
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
}

export async function criar(req, res) {
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
}

export async function atualizar(req, res) {
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
}

export async function excluir(req, res) {
  try {
    await pool.query('DELETE FROM caminhoes WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível excluir o caminhão.' })
  }
}
