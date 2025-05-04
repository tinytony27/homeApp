# Home App

Next.jsとPostgreSQLを使用したWebアプリケーション

## 技術スタック

- Next.js 14 (App Router)
- TypeScript
- PostgreSQL 15
- Docker
- Prisma (ORM)

## 開発環境のセットアップ

### 前提条件

- Docker
- Docker Compose
- Node.js 18以上

### 環境変数の設定

1. 開発環境用の環境変数を設定します：
   ```bash
   cp app/.env.development app/.env
   ```

2. 本番環境用の環境変数を設定します：
   ```bash
   cp app/.env.production app/.env
   ```

3. `.env`ファイルの環境変数を必要に応じて編集します。

### 開発環境の起動

1. 開発環境を起動します：

```bash
docker compose up --build
```

2. アプリケーションにアクセス：
   - フロントエンド: http://localhost:3000
   - データベース: localhost:5432

### 本番環境の起動

1. 本番環境を起動します：

```bash
docker compose -f docker-compose.prod.yml up -d
```

2. アプリケーションにアクセス：
   - フロントエンド: http://localhost:3000
   - データベース: localhost:5432

### その他のコマンド

- コンテナの停止：
  ```bash
  docker compose down
  ```

- 本番環境のコンテナ停止：
  ```bash
  docker compose -f docker-compose.prod.yml down
  ```

- データベースのボリュームを削除：
  ```bash
  docker compose down -v
  ```

## プロジェクト構成

```
homeApp/
├── app/              # Next.js アプリケーション
├── docker/
│   └── app/         # Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── app/.env.development # 開発環境用環境変数
├── app/.env.production  # 本番環境用環境変数
└── README.md
```

## 開発環境と本番環境の違い

### 開発環境
- ホットリロード対応
- ソースコードのマウント
- デバッグモード

### 本番環境
- 最適化ビルド
- 自動再起動
- セキュリティ強化

## トラブルシューティング

1. ポートが既に使用されている場合：
   - 使用中のポートを確認し、必要に応じて変更してください
   - `docker-compose.yml`のポート設定を編集

2. データベース接続エラー：
   - データベースコンテナが起動しているか確認
   - 環境変数が正しく設定されているか確認

3. ビルドエラー：
   - キャッシュをクリアして再ビルド
   ```bash
   docker compose build --no-cache
   ``` 