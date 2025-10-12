import { Router } from 'express';
import * as ChangesController from '../controllers/changes.controllers.js';
import { authenticateApiSecret } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateApiSecret);

router.get('/', ChangesController.getChanges);
router.get('/:id', ChangesController.getChangeById);
router.get('/:type', ChangesController.getChangesByType);

export default router;
