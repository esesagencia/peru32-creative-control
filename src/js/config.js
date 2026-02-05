// src/js/config.js
export const CONFIG = {
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api'
        : '/api',
    
    PERSONAS: {
        P3: {
            id: 'P3',
            name: 'Teletrabajador',
            color: '#6366f1',
        },
        P5: {
            id: 'P5',
            name: 'Vuelta al Pueblo',
            color: '#ec4899',
        },
    },
    
    PHASES: {
        TOFU: 'Awareness',
        MOFU: 'Consideración',
        BOFU: 'Conversión'
    }
};
