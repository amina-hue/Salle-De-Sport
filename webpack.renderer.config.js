// const rules = require('./webpack.rules');

// rules.push(
//   {
//     test: /\.css$/,
//     use: ["style-loader", "css-loader", "postcss-loader"],
//   },
//   {
//     test: /\.(png|jpe?g|gif|svg)$/i,
//     type: "asset/resource",
//   }
// );

// module.exports = {
//   target: 'electron-renderer', // ✅ AJOUTE ÇA

//   module: {
//     rules,
//   },

//   resolve: {
//     extensions: ['.js', '.jsx'],
//   },

//   node: {
//     __dirname: false,
//     __filename: false,
//   },
// };


// // const rules = require('./webpack.rules');

// // rules.push(
// //   {
// //     test: /\.css$/,
// //     use: ["style-loader", "css-loader", "postcss-loader"],
// //   },
// //   {
// //     test: /\.(png|jpe?g|gif|svg)$/i,
// //     type: "asset/resource",
// //   }
// // );

// // module.exports = {
// //   module: {
// //     rules,
// //   },

// //   resolve: {
// //     extensions: ['.js', '.jsx'],
// //   },

// //   node: {
// //     __dirname: false,
// //     __filename: false,
// //   },
// // };



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
  target: 'electron-renderer',

  module: {
    rules,
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      path: require.resolve('path-browserify'),
    },
  },

  externals: {
    mysql2: 'commonjs mysql2',     // ← empêche mysql2 d'être bundlé dans le renderer
    sqlite3: 'commonjs sqlite3',   // ← idem pour sqlite3
  },
};