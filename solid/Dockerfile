FROM node:22-slim

WORKDIR /app

RUN npm install -g pnpm

COPY ./package.json /app/
COPY ./pnpm-lock.yaml /app/

RUN pnpm install

COPY ./ /app

ENTRYPOINT ["pnpm", "start", "--host", "0.0.0.0"]
