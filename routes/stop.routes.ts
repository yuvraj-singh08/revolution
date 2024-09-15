import express from "express";
import isAuth from "../middleware/auth";
import upload from "../config/multer.config";
import * as stopController from '../controllers/stop.controller';

const router = express.Router();

router.post('/uploadCsv', isAuth, upload.single('file'), stopController.createCsvStop);
router.post('/bulkUpdate', isAuth, stopController.updateBulkStop);
router.post('/update', isAuth, stopController.updateStop);
router.get('/', isAuth, stopController.getStops);

export default router;