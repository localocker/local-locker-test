const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
        // Order is last to first
            'style-loader',
            {
                loader: 'css-loader',
                options: {
                    importLoaders: 1
                }
            }, 
            'postcss-loader'
        ],
      },
      {
        test: /\.(png|jpe?g|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name].[ext]'
            }
          }
        ]
      }
    ],
  }
};