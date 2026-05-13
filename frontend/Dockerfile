# Stage 1: Build
FROM node:20 AS builder

WORKDIR /app
COPY package*.json ./
# ใช้ --legacy-peer-deps เพื่อลดปัญหาความขัดแย้งของเวอร์ชัน
RUN npm install --legacy-peer-deps
COPY . .

# รับค่า ENV เพื่อใช้ตอน Build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_IMG_BASE
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_IMG_BASE=$NEXT_PUBLIC_IMG_BASE

# ข้ามการเช็ค Lint และ Type ตอน Build เพื่อความเร็วและลดโอกาสพัง
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 2: Run
FROM node:20-slim AS runner
WORKDIR /app
COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm", "start"]