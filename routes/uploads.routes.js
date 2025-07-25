import * as UploadController from '../controllers/uploads.controllers.js';
import { Router } from 'express';
import { authenticateApiSecret } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const router = Router();

router.use(authenticateApiSecret);

router.post(
  '/member/:id',
  upload.single('pfp'),
  UploadController.uploadImgByMemberId
);
router.post(
  '/signature/:id',
  upload.single('pfp'),
  UploadController.uploadSigByMemberId
);

router.get('/member/:id', UploadController.getPfpByMemberId);

export default router;
