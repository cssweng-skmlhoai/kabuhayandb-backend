import { Router } from 'express';
import * as CertificationsController from '../controllers/certifications.controllers.js';
import { authenticateApiSecret } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateApiSecret);

router.delete('/:id', CertificationsController.deleteCertifications);
router.put('/:id', CertificationsController.updateCertifications);
router.get('/:id', CertificationsController.getCertificationsById);

router.get('/', CertificationsController.getCertifications);
router.post('/', CertificationsController.createCertifications);

export default router;
