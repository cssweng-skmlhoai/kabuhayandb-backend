import * as FamiliesController from '../controllers/families.controllers.js';
import { authenticateApiSecret } from '../middlewares/auth.middleware.js';
import { Router } from 'express';

const router = Router();

router.use(authenticateApiSecret);

// generic id routes
router.get('/:id', FamiliesController.getFamiliesById);
router.delete('/:id', FamiliesController.deleteFamilies);
router.put('/:id', FamiliesController.updateFamilies);

// catch all routes
router.post('/', FamiliesController.createFamilies);
router.get('/', FamiliesController.getFamilies);

export default router;
