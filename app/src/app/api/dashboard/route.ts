import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, subDays } from 'date-fns'

export async function GET() {
  try {
    // 今月の日付範囲
    const today = new Date()
    const startOfThisMonth = startOfMonth(today)
    const endOfThisMonth = endOfMonth(today)

    // 今月の収支データを取得
    const monthlyTransactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: startOfThisMonth,
          lte: endOfThisMonth,
        },
      },
      include: {
        category: true,
      },
    })

    // 今月の収入合計
    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    // 今月の支出合計
    const totalExpense = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    // 最近の取引を取得（最新の5件）
    const recentTransactions = await prisma.transaction.findMany({
      orderBy: {
        date: 'desc',
      },
      take: 5,
      include: {
        category: true,
      },
    })

    // カテゴリ別支出を集計
    const categoryExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const categoryId = t.category.id
        if (!acc[categoryId]) {
          acc[categoryId] = {
            id: categoryId,
            name: t.category.name,
            color: t.category.color,
            amount: 0,
          }
        }
        acc[categoryId].amount += t.amount
        return acc
      }, {} as Record<string, { id: string; name: string; color: string; amount: number }>)

    // 仮の予算データ（本来はDBから取得）
    const budgets = [
      { 
        category: '食費', 
        budget: 50000, 
        spent: Object.values(categoryExpenses).find(c => c.name === '食費')?.amount || 0 
      },
      { 
        category: '日用品', 
        budget: 20000, 
        spent: Object.values(categoryExpenses).find(c => c.name === '日用品')?.amount || 0 
      },
      { 
        category: '交通費', 
        budget: 30000, 
        spent: Object.values(categoryExpenses).find(c => c.name === '交通費')?.amount || 0 
      },
    ]

    // アラートの生成
    const alerts = []

    // 予算超過アラート
    budgets.forEach(budget => {
      if (budget.spent > budget.budget) {
        alerts.push({
          type: 'warning',
          message: `${budget.category}の予算を${Math.round((budget.spent - budget.budget) / 1000)},000円超過しています`,
        })
      } else if (budget.spent > budget.budget * 0.9) {
        alerts.push({
          type: 'info',
          message: `${budget.category}の予算の90%以上を使用しています`,
        })
      }
    })

    // 収支バランスアラート
    if (totalExpense > totalIncome) {
      alerts.push({
        type: 'danger',
        message: `今月は支出が収入を${Math.round((totalExpense - totalIncome) / 1000)},000円上回っています`,
      })
    }

    // レスポンスデータを構築
    const dashboardData = {
      summary: {
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense,
        categoryExpenses: Object.values(categoryExpenses),
      },
      budgets,
      recentTransactions,
      alerts,
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API Error:', error)
    return NextResponse.json(
      { error: 'ダッシュボードデータの取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
} 