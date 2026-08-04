import { randomUUID } from 'crypto'

// Sessões de admin em memória (protótipo): token -> { id, nome, email }.
// Reinicia ao reiniciar o servidor — para produção, trocar por JWT ou
// sessão persistida (Redis, tabela de sessões, etc.).
const adminTokens = new Map()

export function criarSessaoAdmin(admin) {
  const token = randomUUID()
  adminTokens.set(token, admin)
  return token
}

export function encerrarSessaoAdmin(token) {
  adminTokens.delete(token)
}

export function requireAdmin(req, res, next) {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  const admin = token && adminTokens.get(token)
  if (!admin) {
    return res.status(401).json({ erro: 'Não autenticado.' })
  }
  req.admin = admin
  req.adminToken = token
  next()
}
