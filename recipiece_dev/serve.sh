#!/usr/bin/env bash

echo "Starting docker services..."
docker-compose -f ../recipiece_infrastructure/dev/docker-compose.yaml up -d
docker-compose logs -f > ../recipiece_logs/docker.log &
docker_logs_pid=$!

echo "Starting api..."
yarn --cwd ../recipiece_backend start > ../recipiece_logs/backend.log &
api_pid=$!

echo "Starting frontend..."
yarn --cwd ../recipiece_frontend start > ../recipiece_logs/frontend.log &
frontend_pid=$!

yarn --cwd ../recipiece_frontend tailwindcss -i ./src/style/globals.css -o ./public/main.css --watch > ../recipiece_logs/frontend.log &
tailwind_pid=$!

trap 'kill $api_pid' EXIT
trap 'kill $tailwind_pid' EXIT
trap 'kill $frontend_pid' EXIT
trap 'kill $docker_logs_pid' EXIT
trap 'docker-compose -f ../recipiece_infrastructure/dev/docker-compose.yaml down' EXIT

echo "ready to go!"
tail -F ../recipiece_logs/api.log ../recipiece_logs/frontend.log ../recipiece_logs/docker.log
