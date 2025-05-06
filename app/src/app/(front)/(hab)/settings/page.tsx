'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CategorySettings from '@/components/settings/CategorySettings'

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'categories'>('categories')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">設定</h1>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-3 border-b-2 ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              カテゴリ設定
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'categories' && <CategorySettings />}
        </div>
      </div>
    </div>
  )
} 