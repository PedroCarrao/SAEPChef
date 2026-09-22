import { Router } from 'express';
import { listar, listarPorChef, criar, deletar } from '../controllers/receitaController.js';

const router = Router();
router.get('/', listar);
router.get('/chef/:idChef', listarPorChef);
router.post('/', criar);
router.delete('/:id', deletar);

export default router;