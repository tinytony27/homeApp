'use client'

import { useState } from 'react'

export default function DataBackup() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [restoreFile, setRestoreFile] = useState<File | null>(null)
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [restoreSuccess, setRestoreSuccess] = useState(false)
  const [restoreError, setRestoreError] = useState<string | null>(null)

  // バックアップ作成処理
  const handleCreateBackup = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/data-management/backup')
      
      if (!response.ok) {
        throw new Error('バックアップの作成に失敗しました')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      
      // ファイル名を設定
      const fileName = `homeapp_backup_${new Date().toISOString().slice(0, 10)}.json`
      a.download = fileName
      
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      setSuccess(true)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'バックアップ作成中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  // ファイル選択時の処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setRestoreFile(selectedFile)
    setRestoreError(null)
    setRestoreSuccess(false)
  }

  // バックアップ復元処理
  const handleRestoreBackup = async () => {
    if (!restoreFile) {
      setRestoreError('ファイルを選択してください')
      return
    }

    // JSONファイルのバリデーション
    if (restoreFile.type !== 'application/json' && !restoreFile.name.endsWith('.json')) {
      setRestoreError('JSONファイルのみアップロードできます')
      return
    }

    setRestoreLoading(true)
    setRestoreError(null)
    setRestoreSuccess(false)

    try {
      const formData = new FormData()
      formData.append('file', restoreFile)

      const response = await fetch('/api/data-management/restore', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'バックアップの復元に失敗しました')
      }

      await response.json()
      setRestoreSuccess(true)
      setRestoreFile(null)
      
      // フォームをリセット
      const fileInput = document.getElementById('restore-file') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
    } catch (err) {
      console.error('Error:', err)
      setRestoreError(err instanceof Error ? err.message : 'バックアップ復元中にエラーが発生しました')
    } finally {
      setRestoreLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">データバックアップの作成</h2>
        <p className="text-gray-600 mb-4">
          すべてのトランザクションデータをJSONファイルとしてエクスポートします。
          このファイルはデータの復元に使用できます。
        </p>
        
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-500 mb-4">バックアップが完了しました</div>}

        <button
          onClick={handleCreateBackup}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'バックアップ作成中...' : 'バックアップを作成'}
        </button>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-4">バックアップからデータを復元</h2>
        <p className="text-gray-600 mb-4">
          以前に作成したバックアップファイルからデータを復元します。
          この操作は既存のデータを上書きするため、注意が必要です。
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            バックアップファイル
          </label>
          <input
            id="restore-file"
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {restoreError && <div className="text-red-500 mb-4">{restoreError}</div>}
        {restoreSuccess && <div className="text-green-500 mb-4">バックアップの復元が完了しました</div>}

        <button
          onClick={handleRestoreBackup}
          disabled={!restoreFile || restoreLoading}
          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:bg-gray-400"
        >
          {restoreLoading ? '復元中...' : 'バックアップを復元'}
        </button>
      </div>
    </div>
  )
} 