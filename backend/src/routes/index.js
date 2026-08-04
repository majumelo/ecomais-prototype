import { Router } from 'express'
import healthRoutes from './health.routes.js'
import bairrosRoutes from './bairros.routes.js'
import pontosColetaRoutes from './pontosColeta.routes.js'
import caminhoesRoutes from './caminhoes.routes.js'
import motoristasRoutes from './motoristas.routes.js'
import administradoresRoutes from './administradores.routes.js'
import servicosPortalRoutes from './servicosPortal.routes.js'

const router = Router()

router.use('/health', healthRoutes)
router.use('/bairros', bairrosRoutes)
router.use('/pontos-coleta', pontosColetaRoutes)
router.use('/caminhoes', caminhoesRoutes)
router.use('/motoristas', motoristasRoutes)
router.use('/administradores', administradoresRoutes)
router.use('/servicos', servicosPortalRoutes)

export default router
