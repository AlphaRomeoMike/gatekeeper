FROM node:22-alpine AS base

WORKDIR /app

COPY package.json .

COPY pnpm-lock.yaml .

RUN npm i -g pnpm

RUN pnpm install

COPY . .

COPY .env .

RUN pnpm build

FROM base AS development

WORKDIR /app

ENV NODE_ENV development

EXPOSE 3000 9229

RUN chown -R node:node /app

CMD [ "pnpm", "--inspect=0.0.0.0:9229", "start:dev" ]

FROM base AS production

WORKDIR /app

ENV NODE_ENV production

COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules 
COPY --from=base /app/package.json ./
COPY --from=base /app/pnpm-lock.yaml ./
COPY --from=base /app/.env ./

EXPOSE 3000

RUN chown -R node:node /app


CMD [ "node", "dist/main.js" ]