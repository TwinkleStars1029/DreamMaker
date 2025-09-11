# 多階段建置 - 建置階段
FROM node:18-alpine as build-stage

# 設定工作目錄
WORKDIR /app

# 複製 package 檔案
COPY package*.json ./

# 安裝依賴（僅生產依賴）
RUN npm ci --only=production && npm cache clean --force

# 複製原始碼
COPY . .

# 建置應用程式
RUN npm run build

# 生產階段 - 使用 Nginx
FROM nginx:stable-alpine as production-stage

# 複製建置結果到 Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 複製 Nginx 設定檔
COPY nginx.conf /etc/nginx/nginx.conf

# 建立非 root 使用者
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 設定權限
RUN chown -R nextjs:nodejs /usr/share/nginx/html && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d

# 切換到非 root 使用者
USER nextjs

# 暴露端口
EXPOSE 3000

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]

