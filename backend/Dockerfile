FROM node:21-slim
WORKDIR /app

COPY package*.json ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .

EXPOSE 5000

# Run the dev env
CMD ["pnpm", "run", "dev"]