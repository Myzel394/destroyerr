#!/usr/bin/env just --justfile

set dotenv-load := true

_default:
  just --list -u

bundle:
    esbuild ./src/index.ts --bundle --outfile=dist/main.js --platform=node --target=node24 --minify

lint:
    biome format --write ./src

ready:
    just lint && just bundle

dev:
    NODE_ENV=development tsx watch ./src/index.ts

build-docker:
    docker build -t myzel394/destroyerr .

