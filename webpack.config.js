const path = require("path");

module.exports = {
  entry: {
    main: "./src/main.js",
    reviews: "./src/reviews.ts",
    units: "./src/units.ts",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "public"),
    clean: true,
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"],
        },
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          // Order is last to first
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
          "postcss-loader",
        ],
      },
      {
        test: /\.(png|jpe?g|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "images/[name].[ext]",
            },
          },
        ],
      },
    ],
  },
};
