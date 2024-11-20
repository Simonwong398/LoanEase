import type { SwaggerOptions } from './types';

export const swaggerOptions: SwaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LoanEase API',
      version: '1.0.0',
      description: 'API documentation for LoanEase platform'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/routes/*.ts']
};

export default swaggerOptions; 