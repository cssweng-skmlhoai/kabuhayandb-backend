import { Router } from 'express';
import * as CredentialsController from '../controllers/credentials.controllers.js';
import { authenticateApiSecret } from '../middlewares/auth.middleware.js';

const router = Router();

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
