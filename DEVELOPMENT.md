# Developing

Recipiece is open source for all the world to see. Let's get you up and running!

## Rules

1. AI Generated slop will not be accepted. AI Generated and human-massaged mess might be accepted.
2. Test your code.
3. Explain what you did and why in PR descriptions.
4. Be kind.

## First time setup

If you want to get started developing, you will need at a minimum `docker`, `python`, `dotenvx`, and `yarn` (and `node`, by extension) installed on your system.

To perform a first time setup, run `yarn install:fresh` at the root of the repository.
This will run a `yarn install` in all the node based projects and then also setup a venv for the recipe importer project.
Peek at the `package.json` at the repo root if you are curious what exactly it is doing.

## Serving Locally

Recipiece's actual infrastructure is an ubuntu server on digital ocean.
As of this moment, it is acceptable to develop on your local machine even if it is not Ubuntu.

To serve Recipiece locally, run `yarn serve:dev` in the root of this repository.

This will spin up two postgres docker containers and a redis container, and will start the frontend, backend, and recipe parser.

> Note! If this is your first time your postgres container has been created, you will also need to navigate to the `recipiece_backend` directory and run `yarn migrate:dev`. This will run all the prisma migrations against your database.

The UI is accessible at `:3000`.
The backend is served at `:8080`.
The recipe parser is served at `:8081`.

To get some useful data, you can navigate to `recipiece_backend` and run `yarn seed`.

> Note! The `seed` command will delete all users (and by extension all data) from your local database before recreating the seeded users.

The `seed` script will create a user `dev@recipeice.org`, `other@recipiece.org`, and `empty@recipiece.org`, as well as a bunch of recipes, cookbooks, shopping lists, meal plans, and memberships for these users.
All of them share the same super-secure password: `password`.

## Testing

Tests are important, but CI/CD costs $$$$, so create and run the tests yourself when working on things.
The `recipiece_test` project under `recipiece_common` contains lots of goodies for generating sufficiently random data for testing.
Testing requires that your test database container and your redis container are available.

### API Tests

The backend has a `tests` folder that contains API tests.
You can run `yarn test` in the `recipiece_backend` folder to run the tests.
Jest runs these in parallel (and I'd like to keep it that way), so keep that in mind when scaffolding data for these tests.

> Note! These are, in general, required for a PR to be accepted.

### E2E Tests

The `recipiece_e2e` directory contains playwright tests that are concerned with "user stories".
The idea is to run through a whole slew of action related to common use cases, for example inviting another user to your kitchen, or creating a recipe, or whatever else users may commonly do, and then assert that the state of the UI is correct along the way.

> Note! These are not required to be implemented for a PR to be accepted.

To run E2E tests, you first must run `yarn serve:test` in the root of the repo.
This spins up another instance of Recipiece, but this time pointed at the test postgres database.
You can then navigate to `recipiece_e2e` and run `yarn test` to run the playwright tests.
Check the `package.json` there to see some shortcuts.

## Code Style
The TS based projects all have `eslint`/`prettier` setup.
The easiest way to make sure your code is within the style guidelines is just to run `yarn lint` at the root of the repo.

If you use an editor that can format, just install the appropriate plugins and fire away.

> Note! The `lint` command will traverse all projects and perform the linting on the necessary files.

The python service is a little more wild-west, but given that it changes very infrequently, it's not worth the time to setup
something like Ruff imo.

## Branching & PRs

Recipiece uses named versioning which match the current active branch.
For example, all work that will go to the `slotted_spatula` release will be merged into the `slotted_spatula` branch.
While this branch may get deployed when necessary, it will not be merged into the `main` branch until the release is finalized.

When doing work, checkout your branch from the associated feature branch.
Do your work there, then make a PR back into the feature branch.
Branch names should be something like `<username>/<issue number>/<short description>`, but I'm not too picky.
In your PR's, please tag the issue(s) that you are targeting.

> Note! In general, try to limit to a single issue per PR.

I'm not too picky about commit messages; the more important thing to me is that your PR has a good description and outline of what you did and why.

Good issues to start with are tagged as `good first issue`.

## Deep Dive

Okay, you've got the basics down, now lets talk some details.

Recipiece is officially hosted at https://recipiece.org.
The server is currently hosted on an ubuntu-based digital ocean droplet, and the database is a postgres database hosted by Xata.

Recipiece is a hobby project; resources are relatively limited, and the free tier of Xata comes with lots limitations, like `citext` not being available, as well as a cap on the available space.
Develop like you only have 1GB total memory and 5GB of storage available.

### Frontend
The app is written in React, and uses ShadCN for all base UI components.
We do not use the cli to install new components; instead, do the manual "installation" if you need something new from ShadCN.

Recipiece has a dark and a light mode.
Most of the components are able to change their colors appropriately, but it's always worth a once-over in both modes when developing new UI.

Speaking of styling, Recipiece uses Tailwind for styling.
There are very very few times when you should reach for custom CSS; please think thrice before doing so.

We also use react query. In general, the queries are pretty self contained with the exception of Memberships.
These queries are tenuously connected to all other entities, so if you're doing work that involves CRUDing these, keep that in mind.

Make sure you consider loading and error states in your frontend code.

All frontend code is written in TypeScript.
Raw JS will almost never be accepted.
Over-usage of `any` or `unknown` will not be accepted.

### Backend
The backend is an express server. 
There's nothing really out of the ordinary with our usage here, except for the websocket stuff.

> Note! The backend, when serving in dev mode, delays all requests by 1 second. This allows the frontend to display loading states. This does not happen in tests.

All backend code is written in TypeScript.
Raw JS will almost never be accepted.
Over-usage of `any` or `unknown` will not be accepted.

We use `bullmq` to perform various long-running tasks or queue things up for future execution.
To create new jobs, you need to create a `jobs` record before you enqueue to the bullmq Job.

### The Database and Prisma
We use prisma to manage our SQL and as an ORM.
Prisma itself has quite a lot of issues and limitations, so we frequently use Kysely on top of it to actually write queries.
If you're doing anything more complicated than just fetching a few entities or a simple update, we prefer Kysely;
It is easier to read and closer to the true SQL you might actually write.

One thing Prisma does do very well is database migrations.
The schema lives in the `recipiece_database` project in the `recipiece_common` directory.
If you need to make db level changes, simply modify the schema in the `recipiece_database` project, and then in the `recipiece_backend` directory run `yarn migrate:dev`.

> Note! TEST YOUR MIGRATIONS

Please note in your PR what you did any why.

### Building & Production
You can run the various `yarn` scripts in each project to build a service.
In general, this is not necessary unless you suspect something you did may affect the build.
Deployment is handled by myself, as it requires access to sensitive info like our database password, live app secret, etc, but effectively the process is just running a `yarn build:prod` on each node service.

The recipe import service is built on FastAPI.
This service is not exposed publicly, is not locked behind authentication, and should under no circumstances connect to the database.

In the production environment, Nginx handles proxying requests to the appropriate services.
The frontend is just served by Nginx out of a static directory.
Requests to the API are proxied to the API service which is served at port `:444` in the live instance.

The Redis database is simply a docker container spun up on the live instance.
The live postgres database is hosted on Xata using their free tier.

Only ports `:80`, `:443`, and `:444` are publicly accessible in the live instance.

All of the exposed services are secured using LetsEncrypt.


### Adding new Services
TODO -- this is kind of a pain.

### Environment Variables

The frontend and backend services have environment files.
These are injected and managed by `dotenvx`, and in the production system are encrypted.
If you need to add new environment variables, make sure you call this out in the PR, and that you update the appropriate environment files.

> Note! There is a `.env.dev` and a `.env.test` for both the frontend and backend. You should update all of these. The production environment is managed in a separate place and injected when building and deploying.

Below is a table of the various env vars Recipiece uses.

#### recipiece_backend

| Variable                        | Purpose                                                        |
| ------------------------------- | -------------------------------------------------------------- |
| `APP_PORT`                      | The port at which the backend is served.                       |
| `DATABSE_URL`                   | The url to use to connect to a postgres instance               |
| `REDIS_URL`                     | The url to use to connect to a redis instance                  |
| `REDIS_QUEUE_URL`               | The url that bullmq will use to manage queuing                 |
| `APP_RECIPE_PARSER_SERVICE_URL` | The location of the recipe parser service                      |
| `APP_SECRET`                    | The app secret used to encrypt/decrypt things                  |
| `APP_SEND_EMAIL`                | Whether or not to send emails                                  |
| `APP_EMAIL_HOST`                | The host to provide to sendmail to send emails                 |
| `APP_EMAIL_ADDRESS`             | The email address to use to send emails                        |
| `APP_EMAIL_PASSWORD`            | The password to provide to sendmail to send emails             |
| `APP_ENVIRONMENT`               | The environment of the app, not to be confused with `NODE_ENV` |
| `APP_VERSION`                   | The current version of the app                                 |
| `APP_VAPID_PUBLIC_KEY`          | The VAPID public key used to send push notifications           |
| `APP_VAPID_PRIVATE_KEY`         | The VAPID private key used to send push notifications          |
| `APP_ENABLE_PUSH_NOTIFICATIONS` | Whether or not to send push notifications                      |

#### recipiece_frontend

The frontend doesn't really have an "environment", rather `webpack` will inject the variables at build time as static values.

| Variable                     | Purpose                                                |
| ---------------------------- | ------------------------------------------------------ |
| `RECIPIECE_VAPID_PUBLIC_KEY` | The VAPID public key used to manage push notifications |
| `RECIPIECE_WEBSOCKET_URL`    | The websocket url to use for connecting to websockets  |
| `RECIPIECE_API_URL`          | The url to use to connect to the API                   |
| `RECIPIECE_VERSION`          | The current version of Recipiece                       |
