'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TransactionForm from './TransactionForm'

type Category = {
  id: string
  name: string
  type: string
  color: string
}

type Transaction = {
  id: string
  type: 'income' | 'expense'
  amount: number
  date: string
  category: Category
  categoryId: string
  memo: string
  createdAt: string
}

export default function TransactionList() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterCategory, setFilterCategory] = useState('all')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      if (!response.ok) {
        throw new Error('取引の取得に失敗しました')
      }
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この取引を削除してもよろしいですか？')) {
      return
    }

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('取引の削除に失敗しました')
      }

      router.refresh()
      fetchTransactions()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleEdit = async (transaction: Transaction) => {
    setEditingTransaction(transaction)
  }

  const handleUpdate = async (data: { id?: string; type: 'income' | 'expense'; amount: number; date: string; categoryId: string; memo: string; }) => {
    try {
      const response = await fetch(`/api/transactions/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('取引の更新に失敗しました')
      }

      setEditingTransaction(null)
      router.refresh()
      fetchTransactions()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.memo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || transaction.type === filterType
    const matchesCategory = filterCategory === 'all' || transaction.category?.id === filterCategory
    return matchesSearch && matchesType && matchesCategory
  })

  // 編集フォーム用にデータを変換
  const getEditData = (transaction: Transaction) => {
    return {
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      date: new Date(transaction.date).toISOString().split('T')[0],
      category: transaction.categoryId,
      memo: transaction.memo || '',
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">取引一覧</h2>
      
      {/* 検索・フィルター */}
      <div className="mb-4 space-y-4">
        <input
          type="text"
          placeholder="検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <div className="flex space-x-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">すべて</option>
            <option value="income">収入</option>
            <option value="expense">支出</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">すべてのカテゴリ</option>
            {Array.from(new Set(transactions.map(t => t.category ? { id: t.category.id, name: t.category.name } : null)))
              .filter(Boolean)
              .map(category => (
                <option key={category!.id} value={category!.id}>{category!.name}</option>
              ))
            }
          </select>
        </div>
      </div>

      {editingTransaction && (
        <div className="mb-4">
          <TransactionForm
            initialData={getEditData(editingTransaction)}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTransaction(null)}
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日付
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                区分
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                カテゴリ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                金額
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                メモ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.type === 'income' ? '収入' : '支出'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.category?.name}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    transaction.type === 'income'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {transaction.amount.toLocaleString()}円
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {transaction.memo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                  <button
                    onClick={() => handleEdit(transaction)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 