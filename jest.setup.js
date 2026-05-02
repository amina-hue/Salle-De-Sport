import '@testing-library/jest-dom';

// Fix pour react-router-dom (TextEncoder non défini dans jsdom)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;