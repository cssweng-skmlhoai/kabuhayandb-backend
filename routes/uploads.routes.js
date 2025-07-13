import * as UploadController from '../controllers/uploads.controllers.js';
import { Router } from 'express';
import upload from '../middlewares/multer.middleware.js';

const router = Router();

router.post(
  '/member/:id',
  upload.single('pfp'),
  UploadController.uploadImgByMemberId
);

router.get('/member/:id', UploadController.getPfpByMemberId);

export default router;
