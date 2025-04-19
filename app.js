import express from 'express';
import helmet from 'helmet';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import './db.js';

import { connectDB } from './utils/features.js';
import { errorMiddleware } from './middlewares/error.js';

import authenticateRoute from './routers/authenticationRouter.js';
import appointmentRoute  from './routers/appointmentRouter.js';
import diseaseRoute      from './routers/diseaseRouter.js';
import doctorRoute       from './routers/doctorRouter.js';
import drugsRoute        from './routers/drugsRouter.js';
import hpRoute           from './routers/hpRouter.js';
import hsRoute           from './routers/hsRouter.js';
import nurseRoute        from './routers/nurseRouter.js';
import patientRoute      from './routers/patientRouter.js';
import roomRoute         from './routers/roomRouter.js';
import testRoute         from './routers/testRouter.js';

const corsOptions = {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}

dotenv.config({ path: './.env' })

// const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 4173;

// connectDB(mongoURI);

const app = express();
const server = http.createServer(app);

app.disable('x-powered-by');
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'trusted-cdn.com'],
        }
    },
    frameguard: { action: 'deny' },
}));  

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use('/api/v1/auth',       authenticateRoute);
app.use('/api/v1/appointment', appointmentRoute);
app.use('/api/v1/disease',         diseaseRoute);
app.use('/api/v1/doctor',           doctorRoute);
app.use('/api/v1/drug',              drugsRoute);
app.use('/api/v1/hp',                   hpRoute);
app.use('/api/v1/hs',                   hsRoute);
app.use('/api/v1/nurse',             nurseRoute);
app.use('/api/v1/patient',         patientRoute);
app.use('/api/v1/room',               roomRoute);
app.use('/api/v1/test',               testRoute);

app.get('/', (req, res) => {
    res.send('Welcome to MySQL project');
})

app.use(errorMiddleware);

server.listen(port, () => {
    console.log(`Server is currently active on port ${port}`);
})