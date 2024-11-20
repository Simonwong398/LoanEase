"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerUiOptions = exports.swaggerSpec = void 0;
const options_js_1 = require("./options.js");
function generateSwaggerSpec(options) {
    return {
        apis: options.apis,
        definition: options.definition
    };
}
exports.swaggerSpec = generateSwaggerSpec(options_js_1.swaggerOptions);
exports.swaggerUiOptions = {
    explorer: true
};
