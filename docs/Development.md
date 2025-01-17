# Development

Development should be fast and easy to get into.

## Docker

Recipiece has a `docker-compose.dev.yaml` file at the root of the repo.
Assuming you have docker installed on your system, you should just be able to run

```
docker compose -f docker-compose.dev.yaml up
```

and the services should start.
The frontend is served at `:3000`, and has a devServer configuration in its webpack that allows hot reloading and the like.
The backend is served at `:8080` and will run a webpack build with watch, as well as a nodemon script looking out the output bundle.
The recipiece parser is served at `:8081` and uses FastAPI's development server.

Additionally, the docker compose spins up two postgres 16 databases, one for development and one for testing, and a Redis database.

All the usual ports are forwarded to the host machine.

## Non-Docker

If you do not want to use docker, you can spin up each service yourself.
If you explore the Dockerfile for each service, you can see how it is running the processes; these command should work fine locally assuming you have the appropriate tools installed.

## Other Tools

Recipiece uses `dotenvx` to supply env vars to services at runtime.
This tool can be installed through `brew` locally.

Recipiece also uses `yarn` for node package management.

The python services use a virtual environment that you should activate locally if you serve it in a non-docker environment.

## Environment

Recipiece defines a lot of environment variables.
Below is a table of the available env vars.

| variable                      | services                              | notes                                                                                   |
| ----------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------- |
| APP_PORT                      | recipiece_backend                     | The port for the api to serve on                                                        |
| DATABASE_URL                  | recipiece_backend                     | The url to use for connecting to the Postgres database                                  |
| REDIS_URL                     | recipiece_backend                     | The url to use for connecting to the Redis database                                     |
| REDIS_QUEUE_URL               | recipiece_backend                     | The url that bullmq will use to connect to Redis.                                       |
| APP_RECIPE_PARSER_SERVICE_URL | recipiece_backend                     | The location of the recipiece parser service.                                           |
| APP_SECRET                    | recipiece_backend                     | The secret used to encrypt/decrypt                                                      |
| APP_SEND_EMAIL                | recipiece_backend                     | A value of Y or N. Tells recipiece whether or not to actually try to send emails.       |
| APP_EMAIL_HOST                | recipiece_backend                     | The sendmail host to use to send emails.                                                |
| APP_EMAIL_ADDRESS             | recipiece_backend                     | The email address to use to send emails                                                 |
| APP_EMAIL_PASSWORD            | recipiece_backend                     | The password to use for sendmail                                                        |
| APP_ENVIRONMENT               | recipiece_backend                     | A value of either prod or dev, this tells recipiece what environment we're operating in |
| APP_VERSION                   | recipiece_backend                     | The current release version of the app                                                  |
| APP_VAPID_PUBLIC_KEY          | recipiece_backend, recipiece_frontend | The VAPID public key for push notifications                                             |
| APP_VAPID_PRIVATE_KEY         | recipiece_backend                     | The VAPID private key for push notifications                                            |
| APP_ENABLE_PUSH_NOTIFICATIONS | recipiece_backend                     | A value of Y or N, tells recipiece whether or not to actually send push notifications   |
