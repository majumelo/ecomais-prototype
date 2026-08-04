import { Router } from 'express'
import { requireAdmin } from '../middlewares/auth.js'
import * as pontosColetaController from '../controllers/pontosColeta.controller.js'

const router = Router()

router.get('/', pontosColetaController.listar)
router.post('/', requireAdmin, pontosColetaController.criar)
router.put('/:id', requireAdmin, pontosColetaController.atualizar)
router.delete('/:id', requireAdmin, pontosColetaController.excluir)

export default router
