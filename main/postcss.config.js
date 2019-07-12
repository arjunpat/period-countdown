const postcssPresetEnv = require('postcss-preset-env');

module.exports = {
  plugins: [
    postcssPresetEnv({
      browsers: ['> 1%']
    }),
    require('cssnano')
  ]
}