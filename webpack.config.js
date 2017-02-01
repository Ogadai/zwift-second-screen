"use strict";
var webpack = require('webpack');
var path = require('path');
var loaders = require('./webpack.loaders');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var DashboardPlugin = require('webpack-dashboard/plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

const HOST = process.env.HOST || "127.0.0.1";
const PORT = process.env.PORT || "8888";

module.exports = {
	entry: [
		'react-hot-loader/patch',
    './dev.config.js', // config for dev server
    './src/index.jsx'
	],
	devtool: process.env.WEBPACK_DEVTOOL || 'eval-source-map',
	output: {
		publicPath: '/',
		path: path.join(__dirname, 'public'),
		filename: 'bundle.js'
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
	devServer: {
		contentBase: "./public",
		// do not print bundle build stats
		noInfo: true,
		// enable HMR
		hot: true,
		// embed the webpack-dev-server runtime into the bundle
		inline: true,
		// serve index.html in place of 404 responses to allow HTML5 history
		historyApiFallback: true,
		port: PORT,
		host: HOST
	},
	plugins: [
		new webpack.NoErrorsPlugin(),
		new webpack.HotModuleReplacementPlugin(),
	    new ExtractTextPlugin("style.css", {
		      allChunks: true
    }),
    new CopyWebpackPlugin([
      { from: 'img', to: 'img' }
    ]),
		new DashboardPlugin(),
		new HtmlWebpackPlugin({
			template: './src/template.html',
			files: {
				css: ['public/bundle.js']
			}
    })
	]
};
