'use client'

import { useState } from 'react'

type Alert = {
  type: 'info' | 'warning' | 'danger'
  message: string
}

type AlertsProps = {
  alerts: Alert[]
}

export function Alerts({ alerts }: AlertsProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([])

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 border-blue-400 text-blue-700'
      case 'warning':
        return 'bg-yellow-50 border-yellow-400 text-yellow-700'
      case 'danger':
        return 'bg-red-50 border-red-400 text-red-700'
      default:
        return 'bg-gray-50 border-gray-400 text-gray-700'
    }
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'info':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
          </svg>
        )
      case 'danger':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
          </svg>
        )
      default:
        return null
    }
  }

  const dismissAlert = (index: number) => {
    setDismissedAlerts([...dismissedAlerts, index])
  }

  const visibleAlerts = alerts.filter((_, index) => !dismissedAlerts.includes(index))

  if (visibleAlerts.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">注意事項</h2>
      
      <div className="space-y-3">
        {visibleAlerts.map((alert, index) => {
          const alertStyles = getAlertStyles(alert.type)
          
          return (
            <div 
              key={index} 
              className={`flex items-center p-4 border-l-4 rounded ${alertStyles}`}
            >
              <div className="flex-shrink-0 mr-3">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1">
                {alert.message}
              </div>
              <button
                type="button"
                className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => dismissAlert(index)}
                aria-label="閉じる"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
} 