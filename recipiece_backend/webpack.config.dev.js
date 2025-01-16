const path = require("path");
const nodeExternals = require("webpack-node-externals");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: ["./src/index.ts"],
  mode: "development",
  target: "node",
  devtool: "source-map",
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
        include: [
          path.resolve(__dirname, "./src"),
          path.resolve(__dirname, "../recipiece_common/recipiece_types"),
          path.resolve(__dirname, "../recipiece_common/recipiece_database"),
        ],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@recipiece/types": path.resolve(__dirname, "../recipiece_common/recipiece_types/src"),
      "@recipiece/database": path.resolve(__dirname, "../recipiece_common/recipiece_database/src"),
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
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "../recipiece_common/recipiece_database/node_modules/.prisma/client/schema.prisma", to: "./" },
        {
          from: "../recipiece_common/recipiece_database/node_modules/.prisma/client/libquery_engine*.node",
          to: ({ ctx, filename }) => {
            return "./[name][ext]";
          },
        },
      ],
    }),
  ],
};
