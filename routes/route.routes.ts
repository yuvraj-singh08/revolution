import express from "express";
import isAuth from "../middleware/auth";
import upload from "../config/multer.config";
import * as routeController from '../controllers/route.controller';

const router = express.Router();

router.get('/', isAuth, routeController.getRoutes);

export default router;