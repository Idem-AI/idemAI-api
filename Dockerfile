FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm install
RUN npm install @modelcontextprotocol/sdk && npm install fs-extra


COPY ./api ./api


RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app


COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist


RUN npm install --omit=dev

CMD ["node", "./dist/index.js"]
