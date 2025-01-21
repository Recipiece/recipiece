# Building

Recipiece is composed of several smaller services, using either python or typescript as the primary language.

## TypeScript
For projects built in typescript, webpack is used to bundle everything together.
There is also a common set of libraries available to node based projects that live in `recipiece_common`.

When building a webpack config for a "primary" service, such as `recipiece_backend`, you will likely also need to run webpack on the common projects.

All `package.json` files provide a `build:dev` and `build:prod` script that can be run to build the projects.
The output bundles are placed in `dist/dev` or `dist/prod`, respectively.

For backend services, use node to run the resulting `index.js`.
For frontend services, the bundle is best served through a webserver like Nginx.

## Python
There is a python service that exists to parse recipes from URL's using the fantastic (Recipe Scrapers)[https://github.com/hhursev/recipe-scrapers/] library.
This service has no connection to the database, and exposes a very rudimentary API for the backend to communicate with.
It relies on FastAPI, and does not have any explicit build or deploy steps beyond the recommended ones from FastAPI's documentation.

## Prisma
Recipiece also uses prisma for connecting to the database from node services.
The core of prisma-related code is stored in `recipiece_common/recipiece_database`.

When building a node based service such as the backend, you can optionally supply a `TARGET_ARCH` env var to tell prisma which engine to include in the output bundle.
By default, all engines are included in the output bundle.

The current prisma schema defines a native (osx arm for me), alpine (for development use), and debian (for production use) engine.
You can view the webpack for the database or for the backend to see how the `TARGET_ARCH` env var is interpreted at build time.
