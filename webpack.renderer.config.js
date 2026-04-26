const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

// ✅ PAS de webpack.rules — on définit nos propres règles sans asset-relocator
const rules = [
  {
    test: /\.css$/,
    use: ['style-loader', 'css-loader'],
  },
  {
    test: /\.(png|jpg|jpeg|gif|svg)$/,
    type: 'asset/resource',
  },
  {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: { loader: 'babel-loader' },
  },
];

module.exports = {
  entry: './src/renderer.jsx',
  target: 'web',
  module: { rules },
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      path: require.resolve('path-browserify'),
      fs: false,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './src/index.html' }),
  ],
  node: {
    __dirname: false,
    __filename: false,
  },
};