const rules = require('./webpack.rules');

rules.push(
  {
    test: /\.css$/,
    use: ["style-loader", "css-loader", "postcss-loader"],
  },
  {
    test: /\.(png|jpe?g|gif|svg)$/i,
    type: "asset/resource",
  }
);

module.exports = {
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};