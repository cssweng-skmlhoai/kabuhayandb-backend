import { Router } from 'express';
import * as CertificationsController from '../controllers/certifications.controllers.js';
import { authenticateApiSecret } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateApiSecret);

router.get('/member/:id', CertificationsController.getCertificationByMemberId);

router.delete('/:id', CertificationsController.deleteCertification);
router.put('/:id', CertificationsController.updateCertificationMultiple);
router.get('/:id', CertificationsController.getCertificationById);

router.get('/', CertificationsController.getCertifications);
router.post('/', CertificationsController.createCertification);

export default router;
