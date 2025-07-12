import * as HouseholdsController from '../controllers/households.controllers.js';
import { Router } from 'express';

const router = Router();

// generic id routes
router.get('/:id', HouseholdsController.getHouseholdsById);
router.delete('/:id', HouseholdsController.deleteHouseholds);
router.put('/:id', HouseholdsController.updateHouseholds);

// catch all routes
router.post('/', HouseholdsController.createHouseholds);
router.get('/', HouseholdsController.getHouseholds);

export default router;
