import path from "path";
import nodeExternals from "webpack-node-externals";
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
  entry: "./src/index.ts",
  mode: isProduction ? "production" : "development",
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
    path: path.resolve(__dirname, "dist", isProduction ? "prod" : "dev"),
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
        {
          from: `./node_modules/.prisma/client/${libqueryPath}`,
          to: () => {
            return "./[name][ext]";
          },
        },
      ],
    }),
  ],
};

export default config;
