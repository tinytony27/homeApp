'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type BalanceData = {
  income: number
  expense: number
  balance: number
}

type MonthlyData = {
  month: string
  income: number
  expense: number
  balance: number
}

type MonthlyBalanceProps = {
  selectedDate: string // YYYY-MM形式
}

export default function MonthlyBalance({ selectedDate }: MonthlyBalanceProps) {
  const [currentMonthData, setCurrentMonthData] = useState<BalanceData | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // 月次収支データの取得
        const response = await fetch(`/api/analysis/monthly-balance?date=${selectedDate}`)
        if (!response.ok) {
          throw new Error('データの取得に失敗しました')
        }
        const data = await response.json()
        setCurrentMonthData(data.currentMonth)
        setMonthlyData(data.monthlyData)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedDate])

  if (loading) {
    return <div>データを読み込み中...</div>
  }

  if (!currentMonthData) {
    return <div>データがありません</div>
  }

  const formatYen = (value: number) => `${value.toLocaleString()}円`

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 p-4 rounded">
          <div className="text-sm text-gray-600">収入</div>
          <div className="text-lg font-bold text-blue-600">
            {formatYen(currentMonthData.income)}
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded">
          <div className="text-sm text-gray-600">支出</div>
          <div className="text-lg font-bold text-red-600">
            {formatYen(currentMonthData.expense)}
          </div>
        </div>
        <div className={`p-4 rounded ${currentMonthData.balance >= 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <div className="text-sm text-gray-600">収支</div>
          <div className={`text-lg font-bold ${currentMonthData.balance >= 0 ? 'text-green-600' : 'text-yellow-600'}`}>
            {formatYen(currentMonthData.balance)}
          </div>
        </div>
      </div>

      <h3 className="text-md font-medium mb-2">収支推移</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={monthlyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatYen} />
            <Tooltip formatter={(value) => formatYen(value as number)} />
            <Legend />
            <Bar dataKey="income" name="収入" fill="#3B82F6" />
            <Bar dataKey="expense" name="支出" fill="#EF4444" />
            <Bar dataKey="balance" name="収支" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 