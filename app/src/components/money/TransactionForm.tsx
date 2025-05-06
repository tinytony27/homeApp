'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type TransactionType = 'income' | 'expense'
type Category = {
  id: string
  name: string
  type: string
  color: string
}

type TransactionFormProps = {
  initialData?: {
    id: string
    type: TransactionType
    amount: number
    date: string
    category: string
    memo: string
  }
  onSubmit: (data: {
    id?: string
    type: TransactionType
    amount: number
    date: string
    categoryId: string
    memo: string
  }) => Promise<void>
  onCancel?: () => void
}

export default function TransactionForm({ initialData, onSubmit, onCancel }: TransactionFormProps) {
  const router = useRouter()
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense')
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '')
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState(initialData?.category || '')
  const [memo, setMemo] = useState(initialData?.memo || '')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // カテゴリを取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        } else {
          console.error('カテゴリの取得に失敗しました')
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching categories:', error)
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await onSubmit({
        id: initialData?.id,
        type,
        amount: Number(amount),
        date,
        categoryId,
        memo,
      })

      if (!initialData) {
        // 新規作成の場合のみフォームをリセット
        setAmount('')
        setCategoryId('')
        setMemo('')
      }
      
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // タイプに基づいてカテゴリをフィルタリング
  const filteredCategories = categories.filter(cat => cat.type === type)

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">
        {initialData ? '取引の編集' : '取引の登録'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            収支区分
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="expense"
                checked={type === 'expense'}
                onChange={(e) => {
                  setType(e.target.value as TransactionType)
                  setCategoryId('')
                }}
                className="form-radio"
              />
              <span className="ml-2">支出</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="income"
                checked={type === 'income'}
                onChange={(e) => {
                  setType(e.target.value as TransactionType)
                  setCategoryId('')
                }}
                className="form-radio"
              />
              <span className="ml-2">収入</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            金額
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            日付
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            カテゴリ
          </label>
          {loading ? (
            <div className="text-gray-500">カテゴリ読み込み中...</div>
          ) : (
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">選択してください</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id} style={{ color: cat.color }}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メモ
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              キャンセル
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            {initialData ? '更新' : '登録'}
          </button>
        </div>
      </form>
    </div>
  )
} 