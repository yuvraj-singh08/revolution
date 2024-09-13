import express from "express";
import * as driverController from '../controllers/driver.controller';
import isAuth from "../middleware/auth";

const router = express.Router();

router.post("/create", isAuth, driverController.createDriver);
router.post("/login", driverController.loginDriver);
router.get("/allActiveDrivers", driverController.getAllActiveDrivers);


export default router;