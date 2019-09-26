FROM node:10.16.3-alpine

LABEL maintainer="Clovis Djiometsa <diclovis@gmail.com>, Brynette <stewert.bree07@gmail.com>"

ENV LANG C.UTF-8

RUN apk add --no-cache bash

RUN mkdir /app
WORKDIR /app

COPY ./scripts/*.sh /
RUN chmod +x /*.sh

RUN yarn install

COPY . /app

ENTRYPOINT ["/entrypoint.sh"]