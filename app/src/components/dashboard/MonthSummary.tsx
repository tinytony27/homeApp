'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

type CategoryExpense = {
  id: string
  name: string
  color: string
  amount: number
}

type SummaryData = {
  income: number
  expense: number
  balance: number
  categoryExpenses: CategoryExpense[]
}

type MonthSummaryProps = {
  summary: SummaryData
}

export function MonthSummary({ summary }: MonthSummaryProps) {
  // 金額を通貨形式でフォーマット
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { 
      style: 'currency', 
      currency: 'JPY',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // カテゴリグラフのデータ準備
  const pieData = summary.categoryExpenses.map((category) => ({
    name: category.name,
    value: category.amount,
    color: category.color
  }))

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">今月の収支概要</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">収入</p>
          <p className="text-xl font-bold text-blue-600">{formatCurrency(summary.income)}</p>
        </div>
        
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-gray-600">支出</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(summary.expense)}</p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">収支</p>
          <p className={`text-xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(summary.balance)}
          </p>
        </div>
      </div>

      {summary.categoryExpenses.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">カテゴリ別支出</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
} 