const path = require('path')

module.exports = {
  mode: 'development',
  node: {
    fs: 'empty',
  },
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  watch: true
}