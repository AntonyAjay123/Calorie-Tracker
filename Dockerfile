# Dev-oriented image: source is bind-mounted in by docker-compose.yml, so this build
# only needs to produce a working node_modules. `vite` (via `npm run dev`) then picks up
# live edits from the host, hot-reloading as usual.
FROM node:22-alpine

WORKDIR /app

# Install dependencies in their own layer so `npm install` is only re-run when these
# change, not on every source edit.
COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
