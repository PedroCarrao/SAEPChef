import { Router } from 'express';
import { alternarFavorito, buscarEstatisticasChef } from '../controllers/favoritoController.js';

const router = Router();
router.post('/', alternarFavorito);
router.get('/chef/:idChef', buscarEstatisticasChef);

export default router;