FROM node:6.9.4-alpine
ADD ./dist/src /dist
WORKDIR /dist
COPY package.json .
RUN npm install --production && npm install -g pm2
EXPOSE 9999
CMD pm2-docker start index.js -- ../config/config.json