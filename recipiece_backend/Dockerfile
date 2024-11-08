FROM node:alpine3.19

WORKDIR /home
COPY . .
RUN yarn global add typescript tsx && yarn install && yarn prisma generate

CMD ["yarn", "start"]