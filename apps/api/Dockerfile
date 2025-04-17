FROM node:20-alpine3.19 as base

FROM base AS prune
RUN apk update
RUN apk add --no-cache libc6-compat

RUN mkdir -p /app
WORKDIR /app
RUN npm install turbo --global
COPY . .
RUN turbo prune api --docker

FROM base AS installer
WORKDIR /app
COPY --from=prune /app/out/json/ .
RUN npm install

FROM base AS builder
WORKDIR /app
COPY --from=installer /app/node_modules /app/node_modules
COPY --from=prune /app/out/full/ .

RUN npx turbo build --filter=api

FROM base AS development
WORKDIR /app

COPY --from=builder --chown=node:node /app .

WORKDIR /app/apps/api

CMD ["npm", "run", "dev"]