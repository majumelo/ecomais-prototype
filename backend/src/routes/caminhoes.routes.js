import { Router } from 'express'
import { requireAdmin } from '../middlewares/auth.js'
import * as caminhoesController from '../controllers/caminhoes.controller.js'

const router = Router()

router.get('/posicoes', caminhoesController.posicoes)
router.get('/', requireAdmin, caminhoesController.listar)
router.post('/', requireAdmin, caminhoesController.criar)
router.put('/:id', requireAdmin, caminhoesController.atualizar)
router.delete('/:id', requireAdmin, caminhoesController.excluir)

export default router
