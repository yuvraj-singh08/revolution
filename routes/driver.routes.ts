import express from "express";
import * as driverController from '../controllers/driver.controller';
import isAuth from "../middleware/auth";

const router = express.Router();

router.post("/create", isAuth, driverController.createDriver);
router.post("/login", driverController.loginDriver);
router.post("/update", isAuth, driverController.editDriver);
router.post("/PassResetRequest", isAuth, driverController.driverPasswordResetRequest);
router.post("/delete", isAuth, driverController.deleteDriver);
router.post("/setLocation", isAuth, driverController.setDriverLocation);
router.post("/getLocation", isAuth, driverController.getDriverLocation);

router.post("/updateStatus", isAuth, driverController.updateStatusDriver);

router.get("/allActiveDrivers", driverController.getAllActiveDrivers);
router.get("/allDrivers", driverController.getAllDrivers);
router.get("/details", isAuth, driverController.getDriverDetails);


export default router;