'use client'

import { useState, useRef } from 'react'

type CsvImportProps = {
  onImportComplete: () => void
}

export default function CsvImport({ onImportComplete }: CsvImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setError(null)
    setSuccess(false)
  }

  const handleImport = async () => {
    if (!file) {
      setError('ファイルを選択してください')
      return
    }

    // CSVファイルのバリデーション
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('CSVファイルのみアップロードできます')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('mode', importMode)

      const response = await fetch('/api/data-management/import-csv', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'インポートに失敗しました')
      }

      const result = await response.json()
      setSuccess(true)
      
      // フォームをリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setFile(null)
      
      // 完了コールバックを実行
      onImportComplete()
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'インポート中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">CSVからデータをインポート</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CSVファイル
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <p className="mt-1 text-sm text-gray-500">
            CSVファイル形式: type,amount,date,category,memo
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            インポートモード
          </label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="append"
                name="importMode"
                value="append"
                checked={importMode === 'append'}
                onChange={() => setImportMode('append')}
                className="mr-2"
              />
              <label htmlFor="append">既存データに追加（重複チェックあり）</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="replace"
                name="importMode"
                value="replace"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
                className="mr-2"
              />
              <label htmlFor="replace">既存データを置き換え（すべてのデータが削除されます）</label>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">インポートが完了しました</div>}

      <button
        onClick={handleImport}
        disabled={!file || loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'インポート中...' : 'CSVインポート'}
      </button>
    </div>
  )
} 