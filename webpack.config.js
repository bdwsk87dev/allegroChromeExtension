const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry:['./js/background.js'],
    output: {
        path: path.join(__dirname,'dist/js'),
        filename: 'background.js',
        publicPath: 'dist/js'
    },
    resolve: {
        extensions: ['.js'],
    },
    devtool: 'cheap-module-source-map',
    module:{
        rules:[
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
        ],
    }
}