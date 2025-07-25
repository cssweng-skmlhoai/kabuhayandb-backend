import * as DuesController from '../controllers/dues.controllers.js';
import { authenticateApiSecret } from '../middlewares/auth.middleware.js';
import { Router } from 'express';

const router = Router();

router.use(authenticateApiSecret);

router.get('/report', DuesController.getDuesReport);
router.get('/member/:id', DuesController.getDuesByMemberId);

// generic id routes
router.get('/:id', DuesController.getDuesById);
router.delete('/:id', DuesController.deleteDues);
router.put('/:id', DuesController.updateDues);

// catch all routes
router.post('/', DuesController.createDues);
router.get('/', DuesController.getDues);

export default router;
