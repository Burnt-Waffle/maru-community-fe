#!/bin/bash
set -e
cd /home/ubuntu/frontend

export $(cat .env | xargs)

echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker compose pull frontend
docker compose up -d frontend

docker logout
docker image prune -f