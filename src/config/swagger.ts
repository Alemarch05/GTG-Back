import swaggerJSDoc from 'swagger-jsdoc';
// Basicamente usamos sawagger-jsdoc para generar la documentación de la API a partir de los comentarios en el código
//  y swagger-ui-express para servir la documentación generada en una ruta específica del servidor Express
// con .opts le decimos que es un archivo de configuración de swagger y que se va a exportar la variable swaggerSpec 
// que es la que contiene la documentación generada por swagger-jsdoc
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