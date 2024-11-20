import type { SwaggerOptions, SwaggerDoc } from './types.js';
import { swaggerOptions } from './options.js';

function generateSwaggerSpec(options: SwaggerOptions): SwaggerDoc {
  return {
    apis: options.apis,
    definition: options.definition
  };
}

export const swaggerSpec = generateSwaggerSpec(swaggerOptions);
export const swaggerUiOptions = {
  explorer: true
}; 