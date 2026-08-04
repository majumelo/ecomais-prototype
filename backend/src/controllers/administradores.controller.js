import { pool } from '../config/db.js'
import { criarSessaoAdmin, encerrarSessaoAdmin } from '../middlewares/auth.js'

// Login/sessão do administrador (painel admin)
export async function login(req, res) {
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
    const token = criarSessaoAdmin(admin)
    res.json({ token, admin })
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Não foi possível autenticar.' })
  }
}

export function me(req, res) {
  res.json(req.admin)
}

export function logout(req, res) {
  encerrarSessaoAdmin(req.adminToken)
  res.status(204).end()
}
