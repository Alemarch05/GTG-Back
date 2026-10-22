import dotenv from 'dotenv';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { runMigrations } from './migrations/migrate';
import refreshTokenRoutes from './routes/refreshToken.routes';
import campaignRoutes from './routes/campaign.routes';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import contributionRoutes from './routes/contribution.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/users', userRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/auth', refreshTokenRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use('/api/campaigns', campaignRoutes);


async function startServer() {
  try {
    await runMigrations();

    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`Documentación Swagger disponible en http://localhost:${PORT}/docs`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
}

startServer();