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
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_IMG_BASE=$NEXT_PUBLIC_IMG_BASE
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

# ข้ามการเช็ค Lint และ Type ตอน Build เพื่อความเร็วและลดโอกาสพัง
ENV NEXT_TELEMETRY_DISABLED=1

# แก้ไขปัญหา Tailwind 4 native binding โดยการติดตั้งเวอร์ชันสำหรับ linux-x64 โดยตรง
RUN npm install --platform=linux --arch=x64 lightningcss @tailwindcss/oxide-linux-x64-gnu

RUN npm run build

# Stage 2: Run
FROM node:20-slim AS runner
WORKDIR /app
COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm", "start"]