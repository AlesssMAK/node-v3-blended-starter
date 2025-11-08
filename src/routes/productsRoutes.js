import { Router } from 'express';
import {
  getProducts,
  getProguctById,
} from '../controllers/productsController.js';

const router = Router();

router.get('/products', getProducts);

router.get('/products/:productId', getProguctById);

export default router;
