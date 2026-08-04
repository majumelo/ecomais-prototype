import { GraduationCap, HeartPulse, IdCard, Recycle, Sparkles, type LucideIcon } from 'lucide-react'

const ICONE_POR_SERVICO: Record<string, LucideIcon> = {
  'meu-lixo': Recycle,
  'minha-educacao': GraduationCap,
  'minha-saude': HeartPulse,
  'minha-cidadania': IdCard,
}

/** Ícone Lucide para um serviço do portal; cai num ícone genérico se for um serviço novo, cadastrado pelo admin. */
export function iconeDoServico(id: string): LucideIcon {
  return ICONE_POR_SERVICO[id] ?? Sparkles
}
