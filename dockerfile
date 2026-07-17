FROM node:20-alpine

WORKDIR /app

COPY backend/package.json backend/pnpm-lock.yaml ./backend/

RUN npm install -g pnpm
RUN cd backend && pnpm install --frozen-lockfile

COPY backend ./backend

WORKDIR /app/backend
RUN pnpm prisma generate

EXPOSE 5000

CMD ["sh", "-c", "pnpm prisma db push && pnpm dev"]
