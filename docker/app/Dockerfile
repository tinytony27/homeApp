FROM node:18-alpine

WORKDIR /app

# 依存関係のインストール
COPY app/package*.json ./
RUN npm install

# Prismaクライアントの生成
COPY app/prisma ./prisma
RUN npx prisma generate

# アプリケーションのコピー
COPY app .

# 開発サーバーの起動
EXPOSE 3000

CMD ["npm", "run", "dev"]