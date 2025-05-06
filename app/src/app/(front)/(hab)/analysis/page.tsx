'use client'

import { Suspense } from 'react'
import MonthlyBalance from '@/components/analysis/MonthlyBalance'
import CategoryExpenses from '@/components/analysis/CategoryExpenses'
import ComparisonReport from '@/components/analysis/ComparisonReport'
import { useState } from 'react'

export default function AnalysisPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0].slice(0, 7) // YYYY-MM形式
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">収支分析</h1>

      <div className="mb-6">
        <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
          対象月を選択
        </label>
        <input
          type="month"
          id="month"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">月次収支</h2>
          <Suspense fallback={<div>Loading...</div>}>
            <MonthlyBalance selectedDate={selectedDate} />
          </Suspense>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">カテゴリ別支出</h2>
          <Suspense fallback={<div>Loading...</div>}>
            <CategoryExpenses selectedDate={selectedDate} />
          </Suspense>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">前月・前年との比較</h2>
        <Suspense fallback={<div>Loading...</div>}>
          <ComparisonReport selectedDate={selectedDate} />
        </Suspense>
      </div>
    </div>
  )
} 