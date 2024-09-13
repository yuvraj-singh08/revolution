import express from "express";
import * as roleController from '../controllers/roles.controller';

const router = express.Router();

router.post('/addRole', roleController.addUserRole);
router.post('/addResource', roleController.addResource);
router.post('/addPermission', roleController.addPermission);
router.post('/assignRole', roleController.assignRole);
router.get('/allRoles', roleController.getAllRoles);

export default router;