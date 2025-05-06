import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // URLからパラメータを取得
    const url = new URL(request.url)
    const dateParam = url.searchParams.get('date')

    if (!dateParam) {
      return NextResponse.json(
        { error: '日付パラメータが必要です' },
        { status: 400 }
      )
    }

    // 年月の解析 (YYYY-MM形式)
    const [year, month] = dateParam.split('-').map(Number)
    
    // 指定した月の範囲を計算
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    // 支出データの取得
    const expenses = await prisma.transaction.findMany({
      where: {
        type: 'expense',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // 総支出を計算
    const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    // カテゴリ別に集計
    const categoryMap = new Map()
    
    expenses.forEach((expense) => {
      const currentAmount = categoryMap.get(expense.category) || 0
      categoryMap.set(expense.category, currentAmount + expense.amount)
    })

    // 結果をフォーマット
    const categoryExpenses = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? (amount as number / totalExpense) * 100 : 0,
    }))

    // 金額の降順でソート
    categoryExpenses.sort((a, b) => b.amount - a.amount)

    return NextResponse.json(categoryExpenses)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    )
  }
} 