import { Router } from 'express';
import { login, buscarChef } from '../controllers/usuarioController.js';

const router = Router();
router.post('/login', login);
router.get('/chef/:nomeUsuario', buscarChef);

export default router;