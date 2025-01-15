FROM node:alpine3.19

COPY ./recipiece_common /recipiece_common
COPY ./recipiece_backend /recipiece_backend
WORKDIR /recipiece_backend
RUN yarn global add typescript tsx && yarn install && yarn prisma generate

CMD ["yarn", "run-dev"]
