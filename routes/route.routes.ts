import express from "express";
import isAuth from "../middleware/auth";
import upload from "../config/multer.config";
import * as routeController from '../controllers/route.controller';

const router = express.Router();

router.get('/', isAuth, routeController.getRoutes);
router.post('/assign', isAuth, routeController.assignRoute);
router.get('/assigned', isAuth, routeController.getAssignedRoutes);
router.post('/activeRoute/create', isAuth, routeController.createActiveRoutes);
router.get('/activeRoute', isAuth, routeController.getActiveRoutes);
router.post('/activeRoute/finish', isAuth, routeController.finishRoute);
router.post('/unassignRoute', isAuth, routeController.unassignRoute);

export default router;