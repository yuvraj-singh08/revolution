import express, { Request, Response } from 'express';
import cors from 'cors';
import { sequelize } from './models';
require('dotenv').config(); // For environment variables

//Routers
import driverRouter from './routes/driver.routes';
import rolesRouter from './routes/role.routes';
import adminRouter from './routes/admin.routes';
import stopRouter from './routes/stop.routes';
import routeRouter from './routes/route.routes';


const app = express();

// Built-in body parser for JSON
app.use(express.json());

// Built-in body parser for URL-encoded data
app.use(express.urlencoded({ extended: true }));
app.use(cors());

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

import './models/associations/index';

const PORT = process.env.PORT
app.listen(PORT, async () => {
    try {
        await sequelize.sync({ alter: false });
        return console.log(`Server is running on port: ${PORT}`);
    } catch (err) {
        console.log(err)
        throw err;
    }
});