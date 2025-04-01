import path from "path";
import { Configuration } from "webpack";

const isProduction = process.env.NODE_ENV === "production";

const config: Configuration = {
  entry: "./src/index.ts",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
        include: [path.resolve(__dirname, "./src"), path.resolve(__dirname, "../recipiece_constant")],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@recipiece/constant": path.resolve(__dirname, "../recipiece_constant/src"),
    },
  },
  output: {
    path: path.resolve(__dirname, "dist", isProduction ? "prod" : "dev"),
    filename: "index.js",
    library: {
      name: "@recipiece/types",
      type: "commonjs",
    },
  },
};

export default config;
