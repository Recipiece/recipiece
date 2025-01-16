const path = require("path");
const nodeExternals = require("webpack-node-externals");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.ts",
  mode: "development",
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    path: path.resolve(__dirname, "dist/dev"),
    filename: "index.js",
    library: {
      name: "@recipiece/database",
      type: "commonjs",
    },
    clean: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "./node_modules/.prisma/client/schema.prisma", to: "./" },
        { from: "./node_modules/.prisma/client/libquery_engine*.node", to: ({ctx, filename}) => {
          return "./[name][ext]"
        } },
      ],
    }),
  ],
};
