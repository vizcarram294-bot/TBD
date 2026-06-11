import { Router } from 'express';
import { createResource, deleteResource, getResource, listResource, updateResource } from '../controllers/resourceController.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);
router.get('/:resource', requirePermission('SELECT'), listResource);
router.get('/:resource/:id', requirePermission('SELECT'), getResource);
router.post('/:resource', requirePermission('INSERT'), createResource);
router.put('/:resource/:id', requirePermission('UPDATE'), updateResource);
router.delete('/:resource/:id', requirePermission('DELETE'), deleteResource);

export default router;
