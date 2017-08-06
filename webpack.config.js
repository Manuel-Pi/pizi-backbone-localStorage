const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');


const modules = __dirname + "/node_modules/";
const sources = __dirname + "/src/";
const test = __dirname + "/tests/";
const libraryName = 'pizi-backbone-localStorage';

module.exports = {
    entry: {
        'pizi-backbone-localStorage': sources + "pizi-backbone-localStorage.js"
    },
    output: {
        path: __dirname + '/build',
        filename: libraryName + '.js',
        library: libraryName,
        libraryTarget: 'umd',
        umdNamedDefine: true,
        sourceMapFilename: 'js/map/[name].map',
    },
    // devtool: 'inline-source-map',
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            options: {
                "presets": [
                    ["es2015", { "modules": false }]
                ]
            }
        }]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({ name: [libraryName], minChunks: Infinity }),
    ],
    externals: [nodeExternals()]
}