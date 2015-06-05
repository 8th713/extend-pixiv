module.exports = {
  entry: {
    'sort-worklist': './sort-worklist',
    'sort-to-popular': './sort-to-popular'
  },
  output: {
    path: 'gh-pages/',
    filename: '[name]-for-pixiv.user.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' }
    ]
  },
  resolve: {
    modulesDirectories: ['lib', 'web_modules', 'node_modules']
  }
};
