import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Plataforma Crowdfunding API',
      version: '1.0.0',
      description: 'Documentación de endpoints de la API de Crowdfunding',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor Local de Desarrollo',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);