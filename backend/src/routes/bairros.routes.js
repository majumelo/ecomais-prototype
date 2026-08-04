import { Router } from 'express'
import { requireAdmin } from '../middlewares/auth.js'
import * as bairrosController from '../controllers/bairros.controller.js'

const router = Router()

router.get('/', bairrosController.listar)
router.post('/', requireAdmin, bairrosController.criar)
router.put('/:id', requireAdmin, bairrosController.atualizar)
router.delete('/:id', requireAdmin, bairrosController.excluir)

export default router
