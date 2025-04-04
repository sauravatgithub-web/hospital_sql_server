import express from 'express';
import helmet from 'helmet';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import { connectDB } from './utils/features.js';
import { errorMiddleware } from './middlewares/error.js';



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

app.use(errorMiddleware);

server.listen(port, () => {
    console.log(`Server is currently active on port ${port}`);
})