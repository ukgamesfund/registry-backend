FROM node:latest

WORKDIR /talregistry
COPY package.json /talregistry/
RUN npm install

COPY ./ /talregistry
ENTRYPOINT npm run start
