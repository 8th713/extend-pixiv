const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const BabiliPlugin = require('babili-webpack-plugin')

const NODE_ENV = process.env.NODE_ENV || 'development'

const config = {
  entry: {
    'sort-worklist': './packages/sort-worklist',
    'sort-to-popular': './packages/sort-to-popular',
  },
  output: {
    path: path.join(__dirname, 'docs'),
    filename: '[name]-for-pixiv.user.js',
    publicPath: '/',
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    }),
  ],
  module: {
    strictExportPresence: true,
    rules: [
      { parser: { requireEnsure: false } },
      {
        test: /\.js$/,
        enforce: 'pre',
        include: /packages/,
        use: [
          {
            options: {
              baseConfig: { extends: ['react-app'] },
              ignore: false,
              useEslintrc: false,
            },
            loader: 'eslint-loader',
          },
        ],
      },
      {
        test: /\.js$/,
        include: /packages/,
        loader: 'babel-loader',
        options: { cacheDirectory: true }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              singleton: true,
            },
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              minimize: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [autoprefixer({
                browsers: ['last 2 Chrome versions'],
              })],
            },
          },
        ],
      },
    ],
  },
  stats: {colors: true},
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  devtool: 'inline-source-map',
}

if (NODE_ENV === 'production') {
  config.plugins = [
    ...config.plugins,
    new BabiliPlugin(),
    new webpack.BannerPlugin({
      banner: fs.readFileSync('./packages/sort-to-popular/banner.js', 'utf-8'),
      include: /sort-to-popular/,
      raw: true,
    }),
    new webpack.BannerPlugin({
      banner: fs.readFileSync('./packages/sort-worklist/banner.js', 'utf-8'),
      include: /sort-worklist/,
      raw: true,
    }),
  ]
  config.devtool = false
}

module.exports = config
