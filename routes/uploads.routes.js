import * as UploadController from '../controllers/uploads.controllers.js';
import { Router } from 'express';
import upload from '../middlewares/multer.middleware.js';

const router = Router();

router.post(
  '/member/:id',
  upload.single('pfp'),
  UploadController.uploadImgByMemberId
);

export default router;
