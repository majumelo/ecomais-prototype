import { Router } from 'express'
import { requireAdmin } from '../middlewares/auth.js'
import * as administradoresController from '../controllers/administradores.controller.js'

const router = Router()

router.post('/login', administradoresController.login)
router.get('/me', requireAdmin, administradoresController.me)
router.post('/logout', requireAdmin, administradoresController.logout)

export default router
