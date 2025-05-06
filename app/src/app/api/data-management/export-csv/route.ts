import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // URLパラメータの取得
    const url = new URL(request.url)
    const startParam = url.searchParams.get('start')
    const endParam = url.searchParams.get('end')

    // 日付範囲のフィルタリング条件
    let dateFilter = {}
    if (startParam && endParam) {
      dateFilter = {
        date: {
          gte: new Date(startParam),
          lte: new Date(endParam),
        },
      }
    }

    // トランザクションの取得
    const transactions = await prisma.transaction.findMany({
      where: dateFilter,
      orderBy: {
        date: 'desc',
      },
      include: {
        category: true
      }
    })

    // CSVヘッダー
    const headers = ['type', 'amount', 'date', 'category', 'memo']
    
    // CSVデータの生成
    let csvContent = headers.join(',') + '\n'
    
    for (const transaction of transactions) {
      const row = [
        transaction.type,
        transaction.amount,
        transaction.date.toISOString().split('T')[0], // YYYY-MM-DD形式
        transaction.category.name,
        formatCsvField(transaction.memo || ''), // メモはエスケープ処理
      ]
      csvContent += row.join(',') + '\n'
    }

    // CSVをUTF-8でエンコード
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const csvBuffer = await csvBlob.arrayBuffer()

    return new Response(csvBuffer, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('CSV Export Error:', error)
    return NextResponse.json(
      { error: 'CSVエクスポート中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// CSVフィールドのエスケープ処理
function formatCsvField(value: string): string {
  // カンマやダブルクォートを含む場合はダブルクォートで囲み、内部のダブルクォートをエスケープ
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
} 