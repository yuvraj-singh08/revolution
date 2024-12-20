import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { sequelize } from './models';
require('dotenv').config(); // For environment variables

//Routers
import driverRouter from './routes/driver.routes';
import rolesRouter from './routes/role.routes';
import adminRouter from './routes/admin.routes';
import stopRouter from './routes/stop.routes';
import routeRouter from './routes/route.routes';
import reportRouter from './routes/reports.routes';

const app = express();

// Built-in body parser for JSON
app.use(express.json());

// Built-in body parser for URL-encoded data
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
    origin: ['*', 'https://rsvsoftware.live', 'http://localhost:5173', 'http://localhost:5174', 'https://jared.rsvsoftware.live'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.get('/', (req: Request, res: Response) => {
    try {
        res.status(200).send("Server is up and running");
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
})

//Routes
app.use('/api/driver', driverRouter);
app.use('/api/role', rolesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/stop', stopRouter);
app.use('/api/route', routeRouter);
app.use('/api/reports', reportRouter);

app.use((err: any, req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message: message,
    });
});

import './models/associations/index';
import { AuthenticatedRequest } from './middleware/auth';

const PORT = process.env.PORT
app.listen(PORT, async () => {
    try {
        console.log(`Server is running on port: ${PORT}`);
        await sequelize.sync({ alter: false });
        return console.log(`Database Connected`);
    } catch (err) {
        console.log(err)
        throw err;
    }
});