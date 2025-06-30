import * as FamilyMembersController from '../controllers/family_members.controllers.js';
import { authenticateApiSecret } from '../middlewares/auth.middleware.js';
import { Router } from 'express';

const router = Router();

// authenticate api fetch
router.use(authenticateApiSecret);

// generic id routes
router.get('/:id', FamilyMembersController.getFamilyMemberById);
router.delete('/:id', FamilyMembersController.deleteFamilyMembers);
router.put('/:id', FamilyMembersController.updateFamilyMembers);

// name route
router.get('/:first/:last', FamilyMembersController.getMembersByName);

// catch all routes
router.post('/', FamilyMembersController.createFamilyMember);
router.get('/', FamilyMembersController.getFamilyMembers);
export default router;
