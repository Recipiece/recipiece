FROM node:alpine3.19

COPY ./recipiece_common /recipiece_common
COPY ./recipiece_backend /home
WORKDIR /home
RUN yarn global add typescript tsx && yarn install

CMD ["yarn", "start"]