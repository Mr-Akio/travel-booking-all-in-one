# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# รับค่า ENV เพื่อใช้ตอน Build (เพราะ Next.js จะฝังค่า NEXT_PUBLIC_ ลงในไฟล์ JS)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_IMG_BASE
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_IMG_BASE=$NEXT_PUBLIC_IMG_BASE

RUN npm run build

# Stage 2: Run
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm", "start"]