import express from "express";
import isAuth from "../middleware/auth";
import upload from "../config/multer.config";
import * as routeController from '../controllers/route.controller';

const router = express.Router();

router.get('/', isAuth, routeController.getRoutes);
router.post('/assign', isAuth, routeController.assignRoute);
router.get('/assigned', routeController.getAssignedRoutes);

export default router;