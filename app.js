import express from 'express';
import helmet from 'helmet';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import { connectDB } from './utils/features.js';
import { errorMiddleware } from './middlewares/error.js';

import authenticateRoute from './routers/authenticationRouter.js';
import appointmentRoute  from './routers/appointmentRouter.js';
import dieseaseRoute     from './routers/dieseaseRouter.js';
import doctorRoute       from './routers/doctorRouter.js';
import drugsRoute        from './routers/drugsRouter.js';
import fdoRoute          from './routers/fdoRouter.js';
import deoRoute          from './routers/deoRouter.js';
import nurseRoute        from './routers/nurseRouter.js';
import patientRoute      from './routers/patientRouter.js';
import roomRoute         from './routers/roomRouter.js';
import testRoute         from './routers/testRouter.js';
import treatmentRoute    from './routers/treatmentRouter.js';

const corsOptions = {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}

dotenv.config({ path: './.env' })

const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 4173;

connectDB(mongoURI);

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

app.get('/', (req, res) => {
    res.send('Welcome to MySQL project');
})

app.use('/api/v1/auth', authenticateRoute);
app.use('/api/v1/appointment', appointmentRoute);
app.use('/api/v1/disease', dieseaseRoute);
app.use('/api/v1/doctor', doctorRoute);
app.use('/api/v1/drugs', drugsRoute);
app.use('/api/v1/fdo', fdoRoute);
app.use('/api/v1/deo', deoRoute);
app.use('/api/v1/nurse', nurseRoute);
app.use('/api/v1/patient', patientRoute);
app.use('/api/v1/room', roomRoute);
app.use('/api/v1/test', testRoute);
app.use('/api/v1/treatment', treatmentRoute);

app.use(errorMiddleware);

server.listen(port, () => {
    console.log(`Server is currently active on port ${port}`);
})