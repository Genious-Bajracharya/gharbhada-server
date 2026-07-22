FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate

EXPOSE 5000

CMD ["sh", "-c", "pnpm prisma db push && pnpm dev"]