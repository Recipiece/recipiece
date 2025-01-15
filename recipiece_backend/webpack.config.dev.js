const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: ["./src/index.ts"],
  mode: "development",
  target: "node",
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true, // Faster builds for development
            },
          },
        ],
        exclude: /node_modules/,
        include: [path.resolve(__dirname, "./src"), path.resolve(__dirname, "../recipiece_common/recipiece_types")],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@recipiece/types": path.resolve(__dirname, "../recipiece_common/recipiece_types/src"),
    },
  },
  output: {
    path: path.resolve(__dirname, "dist/dev"),
    filename: "index.js",
  },
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 300,
    poll: 1000,
  },
};
