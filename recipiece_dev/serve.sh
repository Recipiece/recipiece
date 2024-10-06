#!/usr/bin/env bash

echo "Sourcing venv..."
source ../recipiece_venv/bin/activate

echo "Starting docker services..."
docker-compose -f ../recipiece_infrastructure/dev/docker-compose.yaml up -d
docker-compose logs -f > ../recipiece_logs/docker.log &
docker_logs_pid=$!

echo "Starting api..."
python3 ../recipiece_backend/manage.py runserver > ../recipiece_logs/api.log &
api_pid=$!

echo "Starting frontend..."
yarn --cwd ../recipiece_frontend start > ../recipiece_logs/frontend.log &
yarn_pid=$!

trap 'kill $api_pid' EXIT
trap 'kill $yarn_pid' EXIT
trap 'kill $docker_logs_pid' EXIT
trap 'docker-compose -f ../recipiece_infrastructure/dev/docker-compose.yaml down' EXIT

echo ""
tail -F ../recipiece_logs/api.log ../recipiece_logs/frontend.log ../recipiece_logs/docker.log
