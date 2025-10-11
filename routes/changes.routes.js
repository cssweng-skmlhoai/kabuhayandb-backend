import { Router } from 'express';
import * as ChangesController from '../controllers/changes.controllers.js';
import { authenticateApiSecret } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateApiSecret);

router.get('/changes', ChangesController.getChanges);
router.get('/changes/:id', ChangesController.getChangeById);
router.get('/changes/:type', ChangesController.getChangesByType);

router.post('/', ChangesController.createChange);

export default router;
