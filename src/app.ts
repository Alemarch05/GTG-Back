import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import refreshTokenRoutes from './routes/refreshToken.routes';
import runMigrations from './config/migrate';

const app = express();

// Middlewares globales
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Ejecutar las migraciones automáticas al iniciar
runMigrations();

// Registrar las rutas de Refresh Tokens
app.use('/api/auth', refreshTokenRoutes);

export default app;