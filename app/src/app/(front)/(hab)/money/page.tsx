'use client'

import { Suspense } from 'react'
import TransactionList from '@/components/money/TransactionList'
import TransactionForm from '@/components/money/TransactionForm'

export default function MoneyPage() {
  const handleSubmit = async (data: { type: 'income' | 'expense'; amount: number; date: string; categoryId: string; memo: string; }) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '取引の登録に失敗しました')
      }

      // 成功時の処理
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : '取引の登録に失敗しました')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">収支管理</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Suspense fallback={<div>Loading...</div>}>
            <TransactionForm onSubmit={handleSubmit} />
          </Suspense>
        </div>
        <div className="md:col-span-2">
          <Suspense fallback={<div>Loading...</div>}>
            <TransactionList />
          </Suspense>
        </div>
      </div>
    </div>
  )
} 