import { PrismaClient } from '@prisma/client'

// PrismaClientのインスタンスをグローバルに保持するための型定義
interface CustomGlobal {
  prisma: PrismaClient | undefined
}

// globalをカスタム型にキャスト
const globalForPrisma = global as unknown as CustomGlobal

// シングルトンとしてのPrismaClientのインスタンス
let prisma: PrismaClient

// `@prisma/client`がビルド時に初期化されていることを確認するためのtry-catch
try {
  if (process.env.NODE_ENV === 'production') {
    // 本番環境では常に新しいインスタンスを作成
    prisma = new PrismaClient()
  } else {
    // 開発環境ではホットリロード対策としてグローバル変数に保存
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
      })
    }
    prisma = globalForPrisma.prisma
  }
} catch (error) {
  console.error('Prismaクライアントの初期化に失敗しました:', error)
  throw new Error('データベース接続の初期化に失敗しました。詳細はサーバーログをご確認ください。')
}

export { prisma } 