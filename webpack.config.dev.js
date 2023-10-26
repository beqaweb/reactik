const path = require('path');
const { merge } = require('webpack-merge');
const prodConfig = require('./webpack.config');

module.exports = merge(prodConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  watchOptions: {
    ignored: /node_modules|test-app|dist/,
  },
});
