// Camada de acesso à API do backend (backend/). Substitui os dados que antes
// vinham de src/data/mock.ts — agora tudo vem do banco `eco_mais` via
// PostgreSQL, passando pelo backend em backend/.

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

export type TipoResiduo = 'organico' | 'reciclavel' | 'geral'

export interface Bairro {
  id: string
  nome: string
  diasColeta: string[]
  horarioPrevisto: string // "06:30:00"
}

export interface PontoColeta {
  id: string
  nome: string
  latitude: string
  longitude: string
  tipoResiduo: TipoResiduo
  bairroId: string
  bairroNome: string
}

export interface PosicaoCaminhao {
  caminhaoId: string
  placa: string
  bairroId: string
  bairroNome: string
  latitude: string
  longitude: string
  atualizadoEm: string
}

export interface MotoristaLogado {
  id: string
  nome: string
  email: string
  telefone: string | null
  caminhao: { id: string; identificador: string } | null
}

export interface AdminLogado {
  id: string
  nome: string
  email: string
}

export interface Motorista {
  id: string
  nome: string
  telefone: string | null
  email: string
  ativo: boolean
}

export interface Caminhao {
  id: string
  identificador: string
  ativo: boolean
  motoristaId: string | null
  motoristaNome: string | null
  bairroId: string | null
  bairroNome: string | null
}

async function tratarResposta<T>(resposta: Response): Promise<T> {
  if (resposta.status === 204) return undefined as T
  const dados = await resposta.json().catch(() => null)
  if (!resposta.ok) {
    throw new Error(dados?.erro ?? `Falha na requisição: ${resposta.status}`)
  }
  return dados as T
}

async function buscarJson<T>(caminho: string): Promise<T> {
  const resposta = await fetch(`${BASE_URL}${caminho}`)
  return tratarResposta<T>(resposta)
}

// Requisições autenticadas do painel admin — exige o token retornado pelo login.
function apiAdmin<T>(token: string, caminho: string, opcoes: RequestInit = {}): Promise<T> {
  return fetch(`${BASE_URL}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...opcoes.headers,
    },
  }).then((resposta) => tratarResposta<T>(resposta))
}

export function buscarBairros() {
  return buscarJson<Bairro[]>('/api/bairros')
}

export function buscarPontosColeta(tipo?: TipoResiduo | 'todos') {
  const query = tipo && tipo !== 'todos' ? `?tipo=${tipo}` : ''
  return buscarJson<PontoColeta[]>(`/api/pontos-coleta${query}`)
}

export function buscarPosicoesCaminhoes() {
  return buscarJson<PosicaoCaminhao[]>('/api/caminhoes/posicoes')
}

export async function loginMotorista(email: string, senha: string) {
  const resposta = await fetch(`${BASE_URL}/api/motoristas/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  })
  return tratarResposta<MotoristaLogado>(resposta)
}

// ---- Painel administrativo ----

export async function loginAdmin(email: string, senha: string) {
  const resposta = await fetch(`${BASE_URL}/api/administradores/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  })
  return tratarResposta<{ token: string; admin: AdminLogado }>(resposta)
}

export function buscarAdminAtual(token: string) {
  return apiAdmin<AdminLogado>(token, '/api/administradores/me')
}

export function logoutAdmin(token: string) {
  return apiAdmin<void>(token, '/api/administradores/logout', { method: 'POST' })
}

export function criarBairro(
  token: string,
  dados: { nome: string; diasColeta: string[]; horarioPrevisto: string },
) {
  return apiAdmin<Bairro>(token, '/api/bairros', { method: 'POST', body: JSON.stringify(dados) })
}

export function atualizarBairro(
  token: string,
  id: string,
  dados: { nome: string; diasColeta: string[]; horarioPrevisto: string },
) {
  return apiAdmin<Bairro>(token, `/api/bairros/${id}`, { method: 'PUT', body: JSON.stringify(dados) })
}

export function excluirBairro(token: string, id: string) {
  return apiAdmin<void>(token, `/api/bairros/${id}`, { method: 'DELETE' })
}

export function criarPontoColeta(
  token: string,
  dados: { nome: string; latitude: number; longitude: number; tipoResiduo: TipoResiduo; bairroId: string },
) {
  return apiAdmin<PontoColeta>(token, '/api/pontos-coleta', { method: 'POST', body: JSON.stringify(dados) })
}

export function atualizarPontoColeta(
  token: string,
  id: string,
  dados: { nome: string; latitude: number; longitude: number; tipoResiduo: TipoResiduo; bairroId: string },
) {
  return apiAdmin<PontoColeta>(token, `/api/pontos-coleta/${id}`, { method: 'PUT', body: JSON.stringify(dados) })
}

export function excluirPontoColeta(token: string, id: string) {
  return apiAdmin<void>(token, `/api/pontos-coleta/${id}`, { method: 'DELETE' })
}

export function buscarMotoristasAdmin(token: string) {
  return apiAdmin<Motorista[]>(token, '/api/motoristas')
}

export function criarMotorista(
  token: string,
  dados: { nome: string; telefone: string; email: string; senha: string },
) {
  return apiAdmin<Motorista>(token, '/api/motoristas', { method: 'POST', body: JSON.stringify(dados) })
}

export function atualizarMotorista(
  token: string,
  id: string,
  dados: { nome: string; telefone: string; email: string; senha?: string; ativo: boolean },
) {
  return apiAdmin<Motorista>(token, `/api/motoristas/${id}`, { method: 'PUT', body: JSON.stringify(dados) })
}

export function excluirMotorista(token: string, id: string) {
  return apiAdmin<void>(token, `/api/motoristas/${id}`, { method: 'DELETE' })
}

export function buscarCaminhoes(token: string) {
  return apiAdmin<Caminhao[]>(token, '/api/caminhoes')
}

export function criarCaminhao(
  token: string,
  dados: { identificador: string; motoristaId: string | null; bairroId: string | null; ativo: boolean },
) {
  return apiAdmin<Caminhao>(token, '/api/caminhoes', { method: 'POST', body: JSON.stringify(dados) })
}

export function atualizarCaminhao(
  token: string,
  id: string,
  dados: { identificador: string; motoristaId: string | null; bairroId: string | null; ativo: boolean },
) {
  return apiAdmin<Caminhao>(token, `/api/caminhoes/${id}`, { method: 'PUT', body: JSON.stringify(dados) })
}

export function excluirCaminhao(token: string, id: string) {
  return apiAdmin<void>(token, `/api/caminhoes/${id}`, { method: 'DELETE' })
}
