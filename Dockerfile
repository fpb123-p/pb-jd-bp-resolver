# pb · 京东 BP 反解工坊 · 多阶段 Dockerfile
# 阶段 1：构建前端
FROM node:20-alpine AS builder
WORKDIR /app

# 安装依赖
COPY package.json package-lock.json* ./
RUN npm ci

# 复制源码并构建
COPY . .
RUN npm run build

# 阶段 2：生产运行时
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# 仅复制生产依赖所需文件
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# 复制构建产物与后端代码
COPY --from=builder /app/dist ./dist
COPY api ./api
COPY server ./server
COPY tsconfig.json ./

EXPOSE 3001
CMD ["npx", "tsx", "api/index.ts"]
