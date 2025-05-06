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

    // 過去6ヶ月分のデータも取得
    const monthlyData = []
    for (let i = 0; i < 6; i++) {
      const targetMonth = new Date(year, month - 1 - i, 1)
      const targetMonthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0)
      
      // その月の取引を取得
      const transactions = await prisma.transaction.findMany({
        where: {
          date: {
            gte: targetMonth,
            lte: targetMonthEnd,
          },
        },
      })

      // 収入と支出を計算
      const income = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const expense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const balance = income - expense

      monthlyData.push({
        month: `${targetMonth.getFullYear()}-${(targetMonth.getMonth() + 1).toString().padStart(2, '0')}`,
        income,
        expense,
        balance,
      })
    }

    // 現在の月のデータ
    const currentMonthData = await prisma.transaction.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const currentIncome = currentMonthData
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const currentExpense = currentMonthData
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const currentBalance = currentIncome - currentExpense

    return NextResponse.json({
      currentMonth: {
        income: currentIncome,
        expense: currentExpense,
        balance: currentBalance,
      },
      monthlyData: monthlyData.reverse(),
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    )
  }
} 