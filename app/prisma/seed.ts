import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // デフォルトの収入カテゴリを作成
  const incomeCategories = [
    { name: '給料', color: '#4CAF50', isDefault: true },
    { name: 'ボーナス', color: '#8BC34A', isDefault: true },
    { name: '副業', color: '#CDDC39', isDefault: true },
    { name: '投資', color: '#FFEB3B', isDefault: true },
    { name: 'お小遣い', color: '#FFC107', isDefault: true },
    { name: 'その他', color: '#9E9E9E', isDefault: true },
  ]

  // デフォルトの支出カテゴリを作成
  const expenseCategories = [
    { name: '食費', color: '#F44336', isDefault: true },
    { name: '日用品', color: '#E91E63', isDefault: true },
    { name: '住居費', color: '#9C27B0', isDefault: true },
    { name: '光熱費', color: '#673AB7', isDefault: true },
    { name: '通信費', color: '#3F51B5', isDefault: true },
    { name: '交通費', color: '#2196F3', isDefault: true },
    { name: '衣服', color: '#03A9F4', isDefault: true },
    { name: '医療費', color: '#00BCD4', isDefault: true },
    { name: '娯楽', color: '#009688', isDefault: true },
    { name: '教育', color: '#4CAF50', isDefault: true },
    { name: '美容', color: '#8BC34A', isDefault: true },
    { name: '交際費', color: '#CDDC39', isDefault: true },
    { name: 'その他', color: '#9E9E9E', isDefault: true },
  ]

  console.log('デフォルトカテゴリを作成中...')

  // 既存のカテゴリを削除（シードを再実行する場合のため）
  await prisma.category.deleteMany({
    where: { isDefault: true }
  })

  // 収入カテゴリの作成
  for (const category of incomeCategories) {
    await prisma.category.create({
      data: {
        name: category.name,
        type: 'income',
        color: category.color,
        isDefault: category.isDefault
      }
    })
  }

  // 支出カテゴリの作成
  for (const category of expenseCategories) {
    await prisma.category.create({
      data: {
        name: category.name,
        type: 'expense',
        color: category.color,
        isDefault: category.isDefault
      }
    })
  }

  console.log('デフォルトカテゴリの作成が完了しました')
}

main()
  .catch((e) => {
    console.error('エラー:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 