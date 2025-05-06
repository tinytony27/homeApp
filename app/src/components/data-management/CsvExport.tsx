'use client'

import { useState } from 'react'

export default function CsvExport() {
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'year' | 'custom'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setLoading(true)
    setError(null)

    try {
      // URLクエリパラメータの構築
      let queryParams = ''

      if (dateRange === 'month') {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        queryParams = `?start=${startOfMonth.toISOString()}&end=${endOfMonth.toISOString()}`
      } else if (dateRange === 'year') {
        const now = new Date()
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        const endOfYear = new Date(now.getFullYear(), 11, 31)

        queryParams = `?start=${startOfYear.toISOString()}&end=${endOfYear.toISOString()}`
      } else if (dateRange === 'custom' && startDate && endDate) {
        queryParams = `?start=${new Date(startDate).toISOString()}&end=${new Date(endDate).toISOString()}`
      }

      // CSVファイルのダウンロード
      const response = await fetch(`/api/data-management/export-csv${queryParams}`)
      
      if (!response.ok) {
        throw new Error('データのエクスポートに失敗しました')
      }

      // CSVデータを取得
      const blob = await response.blob()
      
      // ダウンロードリンクを作成
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      
      // ファイル名を設定
      const fileName = `transactions_${new Date().toISOString().slice(0, 10)}.csv`
      a.download = fileName
      
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'エクスポート中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">トランザクションデータをCSVでエクスポート</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">期間</label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="all"
                name="dateRange"
                value="all"
                checked={dateRange === 'all'}
                onChange={() => setDateRange('all')}
                className="mr-2"
              />
              <label htmlFor="all">すべてのデータ</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="month"
                name="dateRange"
                value="month"
                checked={dateRange === 'month'}
                onChange={() => setDateRange('month')}
                className="mr-2"
              />
              <label htmlFor="month">今月</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="year"
                name="dateRange"
                value="year"
                checked={dateRange === 'year'}
                onChange={() => setDateRange('year')}
                className="mr-2"
              />
              <label htmlFor="year">今年</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="custom"
                name="dateRange"
                value="custom"
                checked={dateRange === 'custom'}
                onChange={() => setDateRange('custom')}
                className="mr-2"
              />
              <label htmlFor="custom">カスタム期間</label>
            </div>
          </div>
        </div>

        {dateRange === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                開始日
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                終了日
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
        )}
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <button
        onClick={handleExport}
        disabled={loading || (dateRange === 'custom' && (!startDate || !endDate))}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'エクスポート中...' : 'CSVエクスポート'}
      </button>
    </div>
  )
} 