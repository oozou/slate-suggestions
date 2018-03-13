const webpack = require('webpack');

module.exports = {
  entry: [
    'react-hot-loader/patch',
    './example/index.js',
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: __dirname + '/example/',
    publicPath: '/',
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  devtool: 'cheap-module-source-map',
  devServer: {
    contentBase: './example',
    hot: true
  }
};