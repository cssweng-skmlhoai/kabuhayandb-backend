import * as MembersController from '../controllers/members.controllers.js';
import { authenticateApiSecret } from '../middlewares/auth.middleware.js';
import { Router } from 'express';

const router = Router();

// authenticate api fetch
router.use(authenticateApiSecret);

// generic id routes
router.get('/:id', MembersController.getMembersById);
router.delete('/:id', MembersController.deleteMembers);
router.put('/:id', MembersController.updateMembers);

// catch all routes
router.post('/', MembersController.createMembers);
router.get('/', MembersController.getMembers);

export default router;
