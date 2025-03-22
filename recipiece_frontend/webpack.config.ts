import path from "path";
import CopyWebpackPlugin from "copy-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { Configuration, DefinePlugin } from "webpack";
import "webpack-dev-server";

const isProduction = process.env.NODE_ENV === "production";

const config: Configuration = {
  mode: isProduction ? "production" : "development",
  entry: "./src/index.tsx",
  devtool: isProduction ? undefined : "cheap-source-map",
  module: {
    rules: [
      {
        test: /.[jt]sx?$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-typescript",
              ["@babel/preset-react", { runtime: "automatic" }],
            ],
          },
        },
        exclude: /node_modules/,
        include: [
          path.resolve(__dirname, "./src"),
          path.resolve(__dirname, "../recipiece_common/recipiece_types"),
          path.resolve(__dirname, "../recipiece_common/recipiece_conversion"),
          path.resolve(__dirname, "../recipiece_common/recipiece_constant"),
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(jpe?g|gif|png)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000,
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        use: ["@svgr/webpack"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
    alias: {
      "@recipiece/types": path.resolve(__dirname, "../recipiece_common/recipiece_types/src"),
      "@recipiece/conversion": path.resolve(__dirname, "../recipiece_common/recipiece_conversion/src"),
      "@recipiece/constant": path.resolve(__dirname, "../recipiece_common/recipiece_constant/src"),
    },
  },
  output: {
    publicPath: "/",
    filename: "index.js",
    path: path.resolve(__dirname, "dist", isProduction ? "prod" : "dev"),
    clean: true,
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public", "index.html"),
      publicPath: "/",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "public",
          to: path.resolve(__dirname, "dist", isProduction ? "prod" : "dev"),
          globOptions: {
            ignore: ["**/index.html"],
          },
        },
      ],
    }),
    new DefinePlugin({
      "process.env.RECIPIECE_VAPID_PUBLIC_KEY": JSON.stringify(process.env.RECIPIECE_VAPID_PUBLIC_KEY),
      "process.env.RECIPIECE_WEBSOCKET_URL": JSON.stringify(process.env.RECIPIECE_WEBSOCKET_URL),
      "process.env.RECIPIECE_API_URL": JSON.stringify(process.env.RECIPIECE_API_URL),
      "process.env.RECIPIECE_VERSION": JSON.stringify(process.env.RECIPIECE_VERSION),
    }),
  ],
  devServer: {
    port: process.env.DEV_PORT ? +process.env.DEV_PORT : 3000,
    historyApiFallback: true,
    liveReload: true,
    static: {
      directory: path.resolve(__dirname, "public"),
      publicPath: "/",
    },
  },
};

export default config;
