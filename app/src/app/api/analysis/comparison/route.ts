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
    
    // 当月の範囲
    const currentStart = new Date(year, month - 1, 1)
    const currentEnd = new Date(year, month, 0)
    
    // 前月の範囲
    const prevMonthStart = new Date(year, month - 2, 1)
    const prevMonthEnd = new Date(year, month - 1, 0)
    
    // 前年同月の範囲
    const prevYearStart = new Date(year - 1, month - 1, 1)
    const prevYearEnd = new Date(year - 1, month, 0)

    // 当月のデータを取得
    const currentData = await getMonthlyData(currentStart, currentEnd)
    
    // 前月のデータを取得
    const prevMonthData = await getMonthlyData(prevMonthStart, prevMonthEnd)
    
    // 前年同月のデータを取得
    const prevYearData = await getMonthlyData(prevYearStart, prevYearEnd)

    return NextResponse.json({
      current: currentData,
      previousMonth: prevMonthData,
      previousYear: prevYearData,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 指定した期間の収支データを取得する関数
async function getMonthlyData(startDate: Date, endDate: Date) {
  // 取引データを取得
  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  })

  // 収入
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  // 支出
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  
  // 収支
  const balance = income - expense

  return { income, expense, balance }
} 