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
router.post('/leaveIncompleteRoute', isAuth, routeController.leaveIncompleteRoute);
router.post('/deleteRoute', isAuth, routeController.deleteRoutes);
router.post('/deleteDayData', isAuth, routeController.deleteDayData);
router.post('/finish', isAuth, routeController.adminFinishRoute);


export default router;