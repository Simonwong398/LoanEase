"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultTheme = void 0;
exports.DefaultTheme = {
    colors: {
        primary: '#1976D2',
        secondary: '#424242',
        background: '#FFFFFF',
        surface: '#FFFFFF',
        error: '#D32F2F',
        warning: '#FFA000',
        success: '#388E3C',
        text: {
            primary: '#212121',
            secondary: '#757575',
            hint: '#9E9E9E',
        },
        border: '#E0E0E0',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },
    borderRadius: {
        sm: 4,
        md: 8,
        lg: 16,
        round: 9999,
    },
    shadows: {
        small: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.18,
            shadowRadius: 1.0,
            elevation: 1,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        large: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.30,
            shadowRadius: 4.65,
            elevation: 8,
        },
    },
    fonts: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
    },
};
