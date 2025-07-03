import * as MembersController from '../controllers/members.controllers.js';
import { Router } from 'express';

const router = Router();

router.get('/home', MembersController.getMembersHome);

// generic id routes
router.get('/:id', MembersController.getMembersById);
router.delete('/:id', MembersController.deleteMembers);
router.put('/:id', MembersController.updateMembers);
router.put('/:id', MembersController.updateMemberMultiple);

// name route
router.get('/:first/:last', MembersController.getMemberByName);

// catch all routes
router.get('/home', MembersController.getMembersHome);
router.post('/', MembersController.createMembers);
router.get('/', MembersController.getMembers);
export default router;
