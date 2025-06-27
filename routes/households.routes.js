import * as HouseholdsController from '../controllers/households.controllers.js';
import { authenticateApiSecret } from '../middlewares/auth.middleware.js';
import { Router } from 'express';

const router = Router();

// authenticate api fetch
router.use(authenticateApiSecret);

// generic id routes
router.get('/:id', HouseholdsController.getHouseholdsById);
router.delete('/:id', HouseholdsController.deleteHouseholds);
router.put('/:id', HouseholdsController.updateHouseholds);

// catch all routes
router.post('/', HouseholdsController.createHouseholds);
router.get('/', HouseholdsController.getHouseholds);

export default router;
