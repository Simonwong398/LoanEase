interface SwaggerDefinition {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
}

interface SwaggerOptions {
  definition: SwaggerDefinition;
  apis: string[];
}

const options: SwaggerOptions = {
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

export default options; 