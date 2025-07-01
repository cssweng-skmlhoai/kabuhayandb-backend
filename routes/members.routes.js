import * as MembersController from '../controllers/members.controllers.js';
import { Router } from 'express';

const router = Router();

// generic id routes
router.get('/:id', MembersController.getMembersById);
router.delete('/:id', MembersController.deleteMembers);
router.put('/:id', MembersController.updateMembers);

// catch all routes
router.get('/home', MembersController.getMembersHome);
router.post('/', MembersController.createMembers);
router.get('/', MembersController.getMembers);

export default router;
