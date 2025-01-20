import path from "path";
import nodeExternals from "webpack-node-externals";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import { Configuration } from "webpack";

const isProduction = process.env.NODE_ENV === "production";
const arch = process.env.TARGET_ARCH ?? "osx";

let libqueryPath = "libquery_engine*.node";
if (arch === "darwin") {
  libqueryPath = "libquery_engine-darwin*.node";
} else if (arch === "debian") {
  libqueryPath = "libquery_engine-debian*.node";
} else if (arch === "musl") {
  libqueryPath = "libquery_engine-linux-musl*.node";
}

const config: Configuration = {
  entry: ["./src/index.ts"],
  mode: isProduction ? "production" : "development",
  target: "node",
  devtool: isProduction ? undefined : "source-map",
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: !isProduction, // Faster builds for development
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
    path: path.resolve(__dirname, "dist", isProduction ? "prod" : "dev"),
    filename: "index.js",
    clean: true,
  },
  watchOptions: {
    ignored: ["**/node_modules", "**/test"],
    aggregateTimeout: 300,
    poll: 1000,
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        memoryLimit: 4096,
      },
    }),
    new CopyPlugin({
      patterns: [
        { from: "../recipiece_common/recipiece_database/node_modules/.prisma/client/schema.prisma", to: "./" },
        {
          from: `../recipiece_common/recipiece_database/node_modules/.prisma/client/${libqueryPath}`,
          to: () => {
            return "./[name][ext]";
          },
        },
      ],
    }),
  ],
};

export default config;
