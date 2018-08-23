const path = require('path')

module.exports = {
  entry: "./app.js",
  output: {
    path: __dirname + "dist",
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loaders: ["css-loader"]
      },
      {
        test: /\.ttf$/,
        use: [
          {
            loader: "ttf-loader",
            options: {
              name: "./font/[hash].[ext]"
            }
          }
        ]
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          "file-loader",
          {
            loader: "image-webpack-loader",
            options: {
              disable: true // webpack@2.x and newer
            }
          }
        ]
      }
    ]
  }
};
