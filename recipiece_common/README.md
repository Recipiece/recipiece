# Recipiece Common

Common libraries, shared between the main projects.

## Adding New Common Libraries

All common libraries should be relatively similar to each other.
To create a new common library:

- create the folder `recipiece_<library_name>`
- run `yarn init` in the folder.
  - the `name` should be set to `@recipiece/<library_name>`
  - the project should be private
- add the necessary dev dependencies

```bash
yarn add -D @swc/core @swc/register webpack webpack-cli eslint ts-loader typescript @types/node
```

- copy `.prettierrc` from one of the other libraries
- copy `.prettierignore` from one of the other libraries. Adjust as needed
- create a `tsconfig.json` containing at a bare minimum

```json
{
  "extends": ["../tsconfig.common.json"],
  "compilerOptions": {
    "outDir": "./dist/dev"
  }
}
```

- create a `webpack.config.ts` containing at a bare minimum

```typescript
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
      name: "@recipiece/<library_name>",
      type: "commonjs",
    },
  },
};

export default config;
```

- create a `src` folder with an `index.ts` in it
- get to coding!

## Using a Common Library

The e2e, frontend, and backend are the primary consumers of these libraries.
To add you library, you need to modify the `webpack.config.ts` and the `tsconfig.json` for the project.

In the webpack, add

```typescript
path.resolve(__dirname, "../recipiece_common/<library_name>"),
```

to the rule in the `rules` array that is handling loading ts.
You also need to add

```typescript
"@recipiece/<library_name>": path.resolve(__dirname, "../recipiece_common/<library_name>/src"),
```

to the `resolve.alias` block.

In the `tsconfig.json`, add

```typescript
"@recipiece/<library_name>": ["../recipiece_common/<library_name>/src/index.ts"],
```

to the `paths` object, and

```typescript
"../recipiece_common/<library_name>/src/**/*";
```

to the `include` array.
