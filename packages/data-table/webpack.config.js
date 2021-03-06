const path = require('path');
const DashboardPlugin = require('webpack-dashboard/plugin');

const dist = path.resolve(__dirname, './build');
const src = path.resolve(__dirname, './src');

const config = {
  entry: {
    index: `${src}/index`,
  },
  output: {
    filename: '[name].js',
    path: `${dist}`,
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: src,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
      },
    ],
  },
  plugins: [
    // make the port diff from other packages to run simultaneously
    new DashboardPlugin({ port: 3001 }),
  ],
};

module.exports = config;
