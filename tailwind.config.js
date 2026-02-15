import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Amarillo TECAAL (Principal)
                brand: {
                    50: '#FFFBEB', // Fondo muy claro
                    100: '#FFF5D1',
                    400: '#F7D452', // Para botones en hover suave
                    500: '#F5C71A', // AMARILLO PRINCIPAL (El de la barra grande)
                    600: '#DDA900', // Un poco más oscuro para hover intenso
                    700: '#B38600',
                },
                // Gris Oscuro TECAAL (Secundario/Acento)
                dark: {
                    500: '#2D2D2D', // Gris carbón (El del pie de página)
                    600: '#1A1A1A', // Casi negro
                    700: '#000000',
                }
            }
        },
    },

    plugins: [forms],
};
