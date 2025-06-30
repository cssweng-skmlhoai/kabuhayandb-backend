import * as FamiliesController from '../controllers/families.controllers.js';
import { Router } from 'express';

const router = Router();

// generic id routes
router.get('/:id', FamiliesController.getFamiliesById);
router.delete('/:id', FamiliesController.deleteFamilies);
router.put('/:id', FamiliesController.updateFamilies);

// catch all routes
router.post('/', FamiliesController.createFamilies);
router.get('/', FamiliesController.getFamilies);

export default router;
