// module.exports = {
//   /**
//    * This is the main entry point for your application, it's the first file
//    * that runs in the main process.
//    */
//   entry: './src/main.js',
//   // Put your normal webpack config below here
//   module: {
//     rules: require('./webpack.rules'),
//   },
// };

// module.exports = {
//   entry: './src/main.js',
//   target: 'electron-main',   // ← AJOUTE ÇA
//   module: {
//     rules: require('./webpack.rules'),
//   },
//   node: {
//     __dirname: false,        // ← AJOUTE ÇA
//     __filename: false,
//   },
// };



module.exports = {
  entry: './src/main.js',
  target: 'electron-main',
  module: {
    rules: require('./webpack.rules'),
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: {
    mysql2: 'commonjs mysql2',
    sqlite3: 'commonjs sqlite3',
  },
};