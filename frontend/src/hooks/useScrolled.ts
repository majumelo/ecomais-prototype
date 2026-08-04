import { useEffect, useState } from 'react'

/** true assim que a página passa de `limite` pixels de rolagem — usado pela navbar. */
export function useScrolled(limite = 8) {
  const [rolado, setRolado] = useState(() => window.scrollY > limite)

  useEffect(() => {
    const aoRolar = () => setRolado(window.scrollY > limite)
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [limite])

  return rolado
}
