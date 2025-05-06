FROM node:18-alpine

WORKDIR /app

# 依存関係のインストール
COPY app/package*.json ./
RUN npm ci
# 明示的にrechartsをインストール
RUN npm install recharts

# Prismaスキーマのコピー
COPY app/prisma ./prisma

# アプリケーションのコピー
COPY app .

# Prismaクライアントの生成（明示的に実行）
RUN npx prisma generate

# 開発サーバーの起動
EXPOSE 3000

# 開発環境起動時にもPrismaクライアントを生成してから起動
CMD ["sh", "-c", "npx prisma generate && npm run dev"]