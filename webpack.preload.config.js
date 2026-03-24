module.exports = {
  target: 'electron-preload',
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