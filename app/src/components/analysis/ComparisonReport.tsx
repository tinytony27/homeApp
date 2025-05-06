'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type ComparisonData = {
  current: {
    income: number
    expense: number
    balance: number
  }
  previousMonth: {
    income: number
    expense: number
    balance: number
  }
  previousYear: {
    income: number
    expense: number
    balance: number
  }
}

type ChartData = {
  name: string
  current: number
  previousMonth: number
  previousYear: number
}

type ComparisonReportProps = {
  selectedDate: string // YYYY-MM形式
}

export default function ComparisonReport({ selectedDate }: ComparisonReportProps) {
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // 比較データの取得
        const response = await fetch(`/api/analysis/comparison?date=${selectedDate}`)
        if (!response.ok) {
          throw new Error('データの取得に失敗しました')
        }
        const data = await response.json()
        setComparisonData(data)

        // チャート用データの整形
        if (data) {
          setChartData([
            {
              name: '収入',
              current: data.current.income,
              previousMonth: data.previousMonth.income,
              previousYear: data.previousYear.income,
            },
            {
              name: '支出',
              current: data.current.expense,
              previousMonth: data.previousMonth.expense,
              previousYear: data.previousYear.expense,
            },
            {
              name: '収支',
              current: data.current.balance,
              previousMonth: data.previousMonth.balance,
              previousYear: data.previousYear.balance,
            },
          ])
        }
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

  if (!comparisonData) {
    return <div>データがありません</div>
  }

  const formatYen = (value: number) => `${value.toLocaleString()}円`

  // 前月比と前年比の計算
  const calculatePercentage = (current: number, previous: number) => {
    if (previous === 0) return current === 0 ? 0 : 100
    return Math.round((current / previous - 1) * 100)
  }

  const renderPercentage = (current: number, previous: number) => {
    const percentage = calculatePercentage(current, previous)
    const isPositive = percentage > 0
    const isZero = percentage === 0

    return (
      <span className={isZero ? 'text-gray-500' : isPositive ? 'text-red-500' : 'text-green-500'}>
        {isPositive ? '+' : ''}{percentage}%
      </span>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2"></th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                当月
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                前月
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                前月比
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                前年同月
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                前年比
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-2 whitespace-nowrap font-medium">収入</td>
              <td className="px-4 py-2 whitespace-nowrap text-blue-600">{formatYen(comparisonData.current.income)}</td>
              <td className="px-4 py-2 whitespace-nowrap">{formatYen(comparisonData.previousMonth.income)}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                {renderPercentage(comparisonData.current.income, comparisonData.previousMonth.income)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">{formatYen(comparisonData.previousYear.income)}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                {renderPercentage(comparisonData.current.income, comparisonData.previousYear.income)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 whitespace-nowrap font-medium">支出</td>
              <td className="px-4 py-2 whitespace-nowrap text-red-600">{formatYen(comparisonData.current.expense)}</td>
              <td className="px-4 py-2 whitespace-nowrap">{formatYen(comparisonData.previousMonth.expense)}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                {renderPercentage(comparisonData.current.expense, comparisonData.previousMonth.expense)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">{formatYen(comparisonData.previousYear.expense)}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                {renderPercentage(comparisonData.current.expense, comparisonData.previousYear.expense)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 whitespace-nowrap font-medium">収支</td>
              <td className={`px-4 py-2 whitespace-nowrap ${comparisonData.current.balance >= 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                {formatYen(comparisonData.current.balance)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">{formatYen(comparisonData.previousMonth.balance)}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                {renderPercentage(comparisonData.current.balance, comparisonData.previousMonth.balance)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">{formatYen(comparisonData.previousYear.balance)}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                {renderPercentage(comparisonData.current.balance, comparisonData.previousYear.balance)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-md font-medium mb-2">比較グラフ</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatYen} />
            <Tooltip formatter={(value) => formatYen(value as number)} />
            <Legend />
            <Bar dataKey="current" name="当月" fill="#3B82F6" />
            <Bar dataKey="previousMonth" name="前月" fill="#9CA3AF" />
            <Bar dataKey="previousYear" name="前年同月" fill="#D1D5DB" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 