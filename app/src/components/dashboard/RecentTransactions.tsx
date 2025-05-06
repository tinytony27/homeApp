'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'

type Transaction = {
  id: string
  type: string
  amount: number
  date: string
  category: {
    name: string
    color: string
  }
  memo?: string
}

type RecentTransactionsProps = {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  // 金額を通貨形式でフォーマット
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { 
      style: 'currency', 
      currency: 'JPY',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'M月d日(E)', { locale: ja })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">最近の取引</h2>
        <Link href="/transactions" className="text-blue-600 hover:text-blue-800 text-sm">
          すべて表示 →
        </Link>
      </div>
      
      {transactions.length === 0 ? (
        <p className="text-gray-500">まだ取引データがありません</p>
      ) : (
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日付
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  カテゴリ
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  メモ
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金額
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: transaction.category.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">
                        {transaction.category.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {transaction.memo || '-'}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium text-right ${
                    transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 