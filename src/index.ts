import dotenv from 'dotenv';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger'; // 👈 Ruta corregida apuntando a src/config/swagger
import { runMigrations } from './migrations/migrate';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Documentación Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas de la API
app.use('/api/users', userRoutes);

async function startServer() {
  try {
    // 1. Ejecutar las migraciones declarativas
    await runMigrations();

    // 2. Levantar el servidor HTTP
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`📄 Documentación Swagger disponible en http://localhost:${PORT}/docs`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
  }
}

startServer();