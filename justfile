#!/usr/bin/env just --justfile

set dotenv-load := true

_default:
  just --list -u

bundle:
    npx spack

lint:
    biome format --write ./src

ready:
    just lint && just bundle

dev:
    NODE_ENV=development tsx watch ./src/index.ts

