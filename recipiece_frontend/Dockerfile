FROM node:alpine3.19

COPY ./recipiece_common/recipiece_types /recipiece_common/recipiece_types
COPY ./recipiece_frontend /recipiece_frontend

RUN apk update && \
    apk upgrade && \
    apk add curl && \
    curl -fsS https://dotenvx.sh | sh && \ 
    cd /recipiece_common/recipiece_types && \ 
    yarn install && \
    cd /recipiece_frontend && \
    yarn install

WORKDIR /recipiece_frontend

CMD ["yarn", "run:dev"]
