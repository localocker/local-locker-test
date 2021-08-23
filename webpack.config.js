const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  plugins: [new MiniCssExtractPlugin()],
  entry: {
    main: "./src/main.js",
    reviews: "./src/reviews.ts",
    units: "./src/units.ts",
    locator: "./src/locator.ts",
    searchbar: "./src/searchbar.js"
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "public"),
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
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
          MiniCssExtractPlugin.loader,
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
  optimization: {
    minimizer: [new CssMinimizerPlugin(), "..."],
  },
  externals: {
    google: "google",
  },
};
