FROM node:20 AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --no-optional

COPY . .

RUN npm run build

FROM node:20-slim

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3000

CMD ["npm", "run", "start"]
