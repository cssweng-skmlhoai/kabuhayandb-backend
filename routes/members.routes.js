import * as MembersController from '../controllers/members.controllers.js';
import { authenticateApiSecret } from '../middlewares/auth.middleware.js';
import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.use(authenticateApiSecret);

router.put(
  '/info/:id',
  upload.single('confirmity_signature'),
  MembersController.updateMemberInfo
);
router.post(
  '/info',
  upload.single('confirmity_signature'),
  MembersController.createMemberInfo
);

// generic id routes
router.get('/info/:id', MembersController.getMemberInfoById);
router.get('/home', MembersController.getMembersHome);

router.get('/:id', MembersController.getMembersById);
router.delete('/:id', MembersController.deleteMembers);
router.patch(
  '/:id',
  upload.single('confirmity_signature'),
  MembersController.updateMembers
);
router.put(
  '/:id',
  upload.single('confirmity_signature'),
  MembersController.updateMemberMultiple
);

// catch all routes
router.post(
  '/',
  upload.single('confirmity_signature'),
  MembersController.createMembers
);
router.get('/', MembersController.getMembers);
export default router;
