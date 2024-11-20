export interface SwaggerDefinition {
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

export interface SwaggerOptions {
  definition: SwaggerDefinition;
  apis: string[];
}

export interface SwaggerDoc {
  apis: string[];
  definition: SwaggerDefinition;
} 