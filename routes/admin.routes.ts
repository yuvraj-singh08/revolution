import express from "express";
import * as adminController from '../controllers/admin.controller';

const router = express.Router();

router.post("/create", adminController.createAdmin);
router.post("/login", adminController.loginAdmin);
router.post("/update", adminController.editAdmin);
router.post("/delete", adminController.deleteAdmin);
router.get("/", adminController.getAdmins);

export default router;