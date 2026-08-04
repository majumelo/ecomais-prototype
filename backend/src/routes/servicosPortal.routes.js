import { Router } from 'express'
import { requireAdmin } from '../middlewares/auth.js'
import * as servicosPortalController from '../controllers/servicosPortal.controller.js'

const router = Router()

router.get('/', servicosPortalController.listar)
router.post('/', requireAdmin, servicosPortalController.criar)
router.put('/:id', requireAdmin, servicosPortalController.atualizar)
router.delete('/:id', requireAdmin, servicosPortalController.excluir)

export default router
