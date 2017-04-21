FROM node:7.9.0

RUN mkdir -p /usr/app/src
WORKDIR /usr/app/src

COPY ./src /usr/app/src
RUN rm config.js
RUN rm static/assets/js/clientConfig.js
COPY ProductionConfig/config.js /usr/app/src/config.js
COPY ProductionConfig/clientConfig.js /usr/app/src/static/assets/js/clientConfig.js
RUN npm install

CMD ["node", "app.js"]
EXPOSE 8888:8888
