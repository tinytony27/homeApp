import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // すべてのトランザクションを取得
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        date: 'desc',
      },
      include: {
        category: true
      }
    })

    // すべてのカテゴリを取得
    const categories = await prisma.category.findMany()

    // バックアップデータの作成
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      transactions,
      categories
    }

    // JSONデータを生成
    const jsonData = JSON.stringify(backupData, null, 2)
    
    // レスポンスを返す
    return new Response(jsonData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="homeapp_backup_${new Date().toISOString().slice(0, 10)}.json"`,
      },
    })
  } catch (error) {
    console.error('Backup Error:', error)
    return NextResponse.json(
      { error: 'バックアップ作成中にエラーが発生しました' },
      { status: 500 }
    )
  }
} 