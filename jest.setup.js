const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

global.MAIN_WINDOW_WEBPACK_ENTRY = 'http://localhost:3000';
global.MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY = '/preload.js';
require('@testing-library/jest-dom');
