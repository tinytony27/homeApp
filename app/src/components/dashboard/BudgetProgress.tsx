'use client'

type Budget = {
  category: string
  budget: number
  spent: number
}

type BudgetProgressProps = {
  budgets: Budget[]
}

export function BudgetProgress({ budgets }: BudgetProgressProps) {
  // 金額を通貨形式でフォーマット
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { 
      style: 'currency', 
      currency: 'JPY',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // 進捗状況のパーセンテージを計算
  const calculatePercentage = (spent: number, budget: number) => {
    return Math.min(Math.round((spent / budget) * 100), 100)
  }

  // 進捗バーの色を決定
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">予算達成状況</h2>
      
      {budgets.length === 0 ? (
        <p className="text-gray-500">予算が設定されていません</p>
      ) : (
        <div className="space-y-6">
          {budgets.map((budget, index) => {
            const percentage = calculatePercentage(budget.spent, budget.budget)
            const progressColor = getProgressColor(percentage)
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{budget.category}</span>
                  <span className="text-gray-600">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${progressColor}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className={percentage >= 100 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                    {percentage}%
                  </span>
                  <span className="text-gray-500">
                    残り: {formatCurrency(Math.max(budget.budget - budget.spent, 0))}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          className="text-blue-600 hover:text-blue-800 text-sm"
          onClick={() => alert('この機能は開発中です')}
        >
          予算を設定する →
        </button>
      </div>
    </div>
  )
} 