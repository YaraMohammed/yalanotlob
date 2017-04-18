FROM node:7.9.0

RUN mkdir -p /usr/app/src
WORKDIR /usr/app/src

COPY ./src/package.json /usr/app/src/package.json
COPY config.js /usr/app/src/config.js
COPY clientConfig.js /usr/app/src/static/assets/js/clientConfig.js
RUN npm install
COPY ./src /usr/app/src

CMD ["node", "app.js"]
EXPOSE 8888:8888
