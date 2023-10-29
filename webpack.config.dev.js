const path = require('path');
const { merge } = require('webpack-merge');
const prodConfig = require('./webpack.config');

module.exports = merge(prodConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  watchOptions: {
    ignored: /node_modules|test-app|dist/,
  },
  externals: {
    react: path.resolve(__dirname, 'test-app/node_modules/react'),
    'react-dom': path.resolve(__dirname, 'test-app/node_modules/react-dom'),
  },
});
