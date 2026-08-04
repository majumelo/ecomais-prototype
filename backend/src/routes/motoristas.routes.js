import { Router } from 'express'
import { requireAdmin } from '../middlewares/auth.js'
import * as motoristasController from '../controllers/motoristas.controller.js'

const router = Router()

router.post('/login', motoristasController.login)
router.get('/', requireAdmin, motoristasController.listar)
router.post('/', requireAdmin, motoristasController.criar)
router.put('/:id', requireAdmin, motoristasController.atualizar)
router.delete('/:id', requireAdmin, motoristasController.excluir)

export default router
