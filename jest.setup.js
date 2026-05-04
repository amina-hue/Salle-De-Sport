<<<<<<< HEAD
=======
import '@testing-library/jest-dom';

// Fix pour react-router-dom (TextEncoder non défini dans jsdom)
>>>>>>> sonia
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;