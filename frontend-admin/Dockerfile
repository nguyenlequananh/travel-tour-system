# ================= STAGE 1: BUILD REACT VITE =================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn và build production
COPY . .
RUN npm run build

# ================= STAGE 2: PHỤC VỤ QUA NGINX SIÊU NHẸ =================
FROM nginx:alpine

# Copy kết quả build vào thư mục tĩnh của Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy file cấu hình Nginx Reverse Proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
