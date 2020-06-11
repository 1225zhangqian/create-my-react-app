const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry:"./example/index.js",
  output: {
    path: path.join(__dirname, '/dist'),
    filename: "bundle.js"
  },
 module: {
    loaders: [
      {
        test: /\.js$/,
        include: /react-context/,
        loaders: ['babel-loader'],
      },
      {
        test: /\.js$/,
        exclude: [/node_modules/, /modules/],
        loaders: ['babel-loader'],
      }, {
        test: /\.jsx$/,
        exclude: [/node_modules/, /modules/],
        loaders: ['jsx-loader', 'babel-loader'],
      }, {
        test: /\.s?css$/,
        loaders: ['style-loader', 'css-loader','sass-loader'],
      }, {
        test: /\.md$/,
        loaders: ['html-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin({ quiet: true }),
    new webpack.NoErrorsPlugin(),
    new HtmlWebpackPlugin({
              template: './example/index.html'
          })
  ],
  quiet: true
}