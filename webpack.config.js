const path = require('path');

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'src/index.ts'),
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    library: 'reactik',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  externals: {
    react: 'react',
    react: 'react-dom',
  },
};
