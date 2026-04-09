module.exports = {
target: 'electron-renderer',
  module: {
    rules: [
      // loaders si besoin
    ],
  },
  node: {
    __dirname: false,
    __filename: false,
  },
};