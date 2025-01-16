FROM node:alpine3.19

COPY ./recipiece_common /recipiece_common
RUN cd /recipiece_common/recipiece_database && yarn install && yarn prisma generate

COPY ./recipiece_backend /recipiece_backend
WORKDIR /recipiece_backend
RUN yarn install --immutable

# CMD ["yarn", "run-dev"]
CMD ["sh", "-c", "yarn install --immutable && yarn run-dev"]
