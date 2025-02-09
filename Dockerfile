FROM node:19.8.1

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY main.js .

CMD node main.js
