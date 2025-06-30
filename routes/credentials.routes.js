import { Router } from 'express';
import * as CredentialsController from '../controllers/credentials.controllers.js';

const router = Router();

router.delete('/:id', CredentialsController.deleteCredentials);
router.put('/:id', CredentialsController.updateCredentials);
router.get('/:id', CredentialsController.getCredentialsById);

router.post('/login', CredentialsController.verifyLogin);
router.get('/', CredentialsController.getCredentials);
router.post('/', CredentialsController.createCredentials);

export default router;
