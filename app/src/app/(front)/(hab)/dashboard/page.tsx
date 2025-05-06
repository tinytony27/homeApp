'use client'

import { useState, useEffect } from 'react'
import { MonthSummary } from '@/components/dashboard/MonthSummary'
import { BudgetProgress } from '@/components/dashboard/BudgetProgress'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { Alerts } from '@/components/dashboard/Alerts'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch('/api/dashboard')
        
        if (!response.ok) {
          throw new Error('ダッシュボードデータの取得に失敗しました')
        }
        
        const data = await response.json()
        setDashboardData(data)
      } catch (err) {
        console.error('Error:', err)
        setError(err instanceof Error ? err.message : 'データの取得中にエラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg mb-2">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        <strong className="font-bold">エラー：</strong>
        <span className="block sm:inline">{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold mb-6">ダッシュボード</h1>
      
      {dashboardData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MonthSummary summary={dashboardData.summary} />
            <BudgetProgress budgets={dashboardData.budgets} />
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {dashboardData.alerts.length > 0 && (
              <Alerts alerts={dashboardData.alerts} />
            )}
            <RecentTransactions transactions={dashboardData.recentTransactions} />
          </div>
        </>
      )}
    </div>
  )
} 