'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CsvExport from '@/components/data-management/CsvExport'
import CsvImport from '@/components/data-management/CsvImport'
import DataBackup from '@/components/data-management/DataBackup'

export default function DataManagementPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'backup'>('export')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">データ管理</h1>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('export')}
              className={`px-6 py-3 border-b-2 ${
                activeTab === 'export'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              CSVエクスポート
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-6 py-3 border-b-2 ${
                activeTab === 'import'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              CSVインポート
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`px-6 py-3 border-b-2 ${
                activeTab === 'backup'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              データバックアップ
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'export' && <CsvExport />}
          {activeTab === 'import' && <CsvImport onImportComplete={() => router.refresh()} />}
          {activeTab === 'backup' && <DataBackup />}
        </div>
      </div>
    </div>
  )
} 