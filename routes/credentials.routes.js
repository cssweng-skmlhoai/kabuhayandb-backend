import { Router } from 'express';
import * as CredentialsController from '../controllers/credentials.controllers.js';
import { authenticateApiSecret } from '../middlewares/auth.middleware.js';

console.log('>>> Credentials router loaded');

const router = Router();

router.post('/reset', CredentialsController.requestPasswordReset);
router.get('/reset/verify', CredentialsController.verifyResetToken);
router.post('/reset/confirm', CredentialsController.confirmPasswordReset);

router.use(authenticateApiSecret);

router.get('/member/:id', CredentialsController.getCredentialsByMemberId);
router.post('/password/:id', CredentialsController.changePassword);
router.delete('/:id', CredentialsController.deleteCredentials);
router.put('/:id', CredentialsController.updateCredentials);
router.get('/:id', CredentialsController.getCredentialsById);

router.post('/login', CredentialsController.verifyLogin);
router.get('/', CredentialsController.getCredentials);
router.post('/', CredentialsController.createCredentials);

export default router;
