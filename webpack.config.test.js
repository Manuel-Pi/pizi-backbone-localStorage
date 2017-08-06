const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const modules = __dirname + "/node_modules/";
const sources = __dirname + "/src/";
const test = __dirname + "/tests/";
const libraryName = 'pizi-backbone-localStorage';

const extractHtml = new ExtractTextPlugin('index.html');

module.exports = {
    entry: {
        'pizi-backbone-localStorage': test + "test.js"
    },
    output: {
        path: __dirname + '../../../Servers/PiziServer/pizi-backbone-localStorage',
        filename: '[name].js',
        sourceMapFilename: 'js/map/[name].map',
    },
    // devtool: 'inline-source-map',
    module: {
        loaders: [{
            test: /\.html$/,
            loader: extractHtml.extract({
                loader: "html-loader"
            }),
            exclude: /node_modules/
        }]
    },
    plugins: [
        new webpack.ProvidePlugin({
            _: "underscore"
        }),
        extractHtml,
        new webpack.optimize.CommonsChunkPlugin({ name: [libraryName], minChunks: Infinity }),
    ]
}