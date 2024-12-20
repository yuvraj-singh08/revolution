import express from "express";
import * as reportsController from '../controllers/reports.controller';
import isAuth from "../middleware/auth";

const router = express.Router();

router.post("/getReport", isAuth, reportsController.getReport);
router.post("/getLog", reportsController.getLog);

export default router;