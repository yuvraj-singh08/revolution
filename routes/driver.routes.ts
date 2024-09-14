import express from "express";
import * as driverController from '../controllers/driver.controller';
import isAuth from "../middleware/auth";

const router = express.Router();

router.post("/create", isAuth, driverController.createDriver);
router.post("/login", driverController.loginDriver);
router.post("/update", isAuth, driverController.editDriver);
router.post("/delete", isAuth, driverController.deleteDriver);

router.get("/allActiveDrivers", driverController.getAllActiveDrivers);
router.get("/allDrivers", driverController.getAllDrivers);
router.get("/details", isAuth, driverController.getDriverDetails);


export default router;