"use strict";
var webpack = require('webpack');
var path = require('path');
var loaders = require('./webpack.loaders');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var WebpackCleanupPlugin = require('webpack-cleanup-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: [
		'./src/index.jsx'
	],
	output: {
		publicPath: '/',
		path: path.join(__dirname, 'public'),
		filename: '[chunkhash].js'
	},
	resolve: {
		extensions: ['', '.js', '.jsx']
	},
	module: {
		loaders
	},
  postcss: () => {
    return [
      require('postcss-import'),
      require('postcss-cssnext')
    ];
  },
	plugins: [
		new WebpackCleanupPlugin(),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"production"'
			}
		}),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false,
				screw_ie8: true,
				drop_console: true,
				drop_debugger: true
			}
		}),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.DedupePlugin(),
	    new ExtractTextPlugin("style.css", {
		      allChunks: true
		}),
    new CopyWebpackPlugin([
      { from: 'img', to: 'img' }
    ]),
    new HtmlWebpackPlugin({
      template: './src/template.html',
      files: {
        css: ['public/bundle.js']
      }
    })
	]
};
