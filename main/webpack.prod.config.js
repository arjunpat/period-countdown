const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// generate hash
const crypto = require('crypto');
const date = Date.now().toString();
const random = Math.random().toString();
const appHash = crypto.createHash('sha1').update(date + random).digest('hex').substr(0, 6);

require('fs').rmdirSync('./public/dist', { recursive: true });

// add header plugin
class PeriodsIoPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('PeriodsIoPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('PeriodsIoPlugin', (data, cb) => {
        data.html = `<!--\ncreated and maintained by Arjun P (MVHS)\ncontact help@periods.io for questions, suggestions, and bugs\n-->\n\n` + data.html;

        cb(null, data);
      });
    });
  }
}

module.exports = {
  entry: ['whatwg-fetch', './src/scripts/main.js', './src/styles/main.css'],
  output: {
    filename: `dist/bundle.${appHash}.js`,
    publicPath: '/dist',
    path: path.resolve(__dirname, 'public')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      },
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
    }),
    new PeriodsIoPlugin()
  ],
  mode: 'production'
}