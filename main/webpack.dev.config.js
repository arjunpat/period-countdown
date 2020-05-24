const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appHash = 'dev';

module.exports = {
  entry: ['./src/scripts/main.js', './src/styles/main.css'],
  output: {
    filename: `dist/bundle.${appHash}.js`,
    publicPath: '/dist',
    path: path.resolve(__dirname, 'public')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2
            }
          },
          {
            loader: 'postcss-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: `dist/bundle.${appHash}.css`
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.ejs',
      filename: 'index.html',
      inject: false,
      appHash
    })
  ],
  devtool: 'inline-source-map',
  mode: 'development'
}