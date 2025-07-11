FROM node:24 AS builder

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --production

COPY . .

RUN npx esbuild ./src/index.ts --bundle --outfile=dist/main.js --platform=node --target=node24 --minify

FROM node:24-alpine

USER root
WORKDIR /app

RUN apk add curl

COPY --from=builder /app/dist/main.js .

CMD ["main.js"]

