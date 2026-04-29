import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import authRoutes from '../routes/authRoutes.js';
import provinceRoutes from '../routes/provinceRoutes.js';
import districtRoutes from '../routes/districtRoutes.js';
import roleRoutes from '../routes/roleRoutes.js';
import officeRoutes from '../routes/officeRoutes.js';
import userRoutes from '../routes/userRoutes.js';
import ownerRoutes from '../routes/ownerRoutes.js';


const app = express();
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS?.split(',') : '*',
    credentials: true,
}));

//rate limiter configurations
const globalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max:      parseInt(process.env.RATE_LIMIT_MAX)        || 100,
    message:  { success: false, message: 'Too many requests, please try again later' },
});

// Stricter limiter for auth endpoints to prevent brute force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max:      20,               // 20 login attempts per 15 min per IP
    message:  { success: false, message: 'Too many login attempts, please try again later' },
});

app.use(globalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//main route definition
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/provinces', provinceRoutes);
app.use('/api/v1/districts', districtRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/offices', officeRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/owners', ownerRoutes);

//handle 404 not found cases
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

//handle unknown errors
app.use((err, req, res, next) => {
    console.error('[UNHANDLED ERROR]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

export default app;