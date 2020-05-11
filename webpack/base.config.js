const nodeExternals = require("webpack-node-externals");
const path = require("path");

const Dotenv = require("dotenv-webpack");

const BUILD_ROOT = path.join(__dirname, "../dist");
const SRC_ROOT = path.join(__dirname, "../src");

module.exports = {
  context: SRC_ROOT,
  entry: path.resolve(SRC_ROOT, "app.ts"),
  // ブラウザではなくnodeで動くのでnode_modules配下をバンドルする必要がない
  externals: [nodeExternals()], // Need this to avoid error when working with Express
  output: {
    filename: "index.js",
    path: BUILD_ROOT,
  },
  target: "node",
  node: {
    // Need this when working with express, otherwise the build fails
    __dirname: false, // if you don't put this is, __dirname
    __filename: false, // and __filename return blank or /
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: "ts-loader",
        options: {
          configFile: "tsconfig.json",
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
    alias: {
      "~": path.resolve(__dirname, SRC_ROOT),
    },
  },
  plugins: [new Dotenv()],
};
