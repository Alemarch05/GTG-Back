import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();
//es una anotación de JSDoc OpenAPI que lee la librería swagger-jsdoc.
//Su función es generar automáticamente la documentación interactiva en Swagger UI 
// (http://localhost:3000/docs) a partir del propio código de las rutas.

/**
 * @openapi
 * /users/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 */
router.post('/register', (req, res) => userController.register(req, res));

export default router;