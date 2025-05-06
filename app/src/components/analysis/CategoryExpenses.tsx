'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

type CategoryExpense = {
  category: string
  amount: number
  percentage: number
}

type CategoryExpensesProps = {
  selectedDate: string // YYYY-MM形式
}

// カラーパレット
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A4DE6C', '#D0ED57', '#83a6ed', '#8dd1e1']

export default function CategoryExpenses({ selectedDate }: CategoryExpensesProps) {
  const [categoryData, setCategoryData] = useState<CategoryExpense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // カテゴリ別支出データの取得
        const response = await fetch(`/api/analysis/category-expenses?date=${selectedDate}`)
        if (!response.ok) {
          throw new Error('データの取得に失敗しました')
        }
        const data = await response.json()
        setCategoryData(data)
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

  if (categoryData.length === 0) {
    return <div>データがありません</div>
  }

  const formatYen = (value: number) => `${value.toLocaleString()}円`
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  return (
    <div>
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
              nameKey="category"
              label={({ name, percent }) => `${name}: ${formatPercentage(percent * 100)}`}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatYen(value as number)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                カテゴリ
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                金額
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                割合
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categoryData.map((category, index) => (
              <tr key={index}>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {category.category}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatYen(category.amount)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatPercentage(category.percentage)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 