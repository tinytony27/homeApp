'use client'

import { useState, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'

type Category = {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
  isDefault: boolean
}

export default function CategorySettings() {
  const [activeType, setActiveType] = useState<'income' | 'expense'>('expense')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#3B82F6',
  })
  const [showColorPicker, setShowColorPicker] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [activeType])

  const fetchCategories = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/settings/categories?type=${activeType}`)
      
      if (!response.ok) {
        throw new Error('カテゴリの取得に失敗しました')
      }
      
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'カテゴリの取得中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      setError('カテゴリ名を入力してください')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/settings/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategory.name.trim(),
          type: activeType,
          color: newCategory.color,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'カテゴリの追加に失敗しました')
      }

      // 新しいカテゴリをリストに追加
      await fetchCategories()
      
      // フォームをリセット
      setNewCategory({
        name: '',
        color: '#3B82F6',
      })
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'カテゴリの追加中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory({
      ...category,
    })
  }

  const saveEditedCategory = async () => {
    if (!editingCategory) return
    
    if (!editingCategory.name.trim()) {
      setError('カテゴリ名を入力してください')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/settings/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingCategory.name.trim(),
          color: editingCategory.color,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'カテゴリの更新に失敗しました')
      }

      // カテゴリリストを更新
      await fetchCategories()
      
      // 編集モードを終了
      setEditingCategory(null)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'カテゴリの更新中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('このカテゴリを削除してもよろしいですか？')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/settings/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'カテゴリの削除に失敗しました')
      }

      // カテゴリリストを更新
      await fetchCategories()
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'カテゴリの削除中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">カテゴリの管理</h2>
        
        <div className="mb-4">
          <div className="flex border-b">
            <button
              onClick={() => setActiveType('expense')}
              className={`px-4 py-2 ${
                activeType === 'expense'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500'
              }`}
            >
              支出カテゴリ
            </button>
            <button
              onClick={() => setActiveType('income')}
              className={`px-4 py-2 ${
                activeType === 'income'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500'
              }`}
            >
              収入カテゴリ
            </button>
          </div>
        </div>
        
        {error && <div className="text-red-500 mb-4">{error}</div>}
        
        <div className="mb-6">
          <h3 className="text-md font-medium mb-2">新しいカテゴリを追加</h3>
          <div className="flex gap-2">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="カテゴリ名"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="px-3 py-2 border border-gray-300 rounded-md"
                style={{ backgroundColor: newCategory.color }}
              >
                <span className="sr-only">色を選択</span>
              </button>
              {showColorPicker && (
                <div className="absolute z-10 mt-2 right-0">
                  <HexColorPicker
                    color={newCategory.color}
                    onChange={(color: string) => setNewCategory({...newCategory, color})}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(false)}
                      className="px-2 py-1 text-sm text-gray-600 bg-gray-100 rounded"
                    >
                      閉じる
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleAddCategory}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
            >
              追加
            </button>
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-medium mb-2">カテゴリ一覧</h3>
          {loading && categories.length === 0 ? (
            <div>カテゴリを読み込み中...</div>
          ) : categories.length === 0 ? (
            <div>カテゴリがありません</div>
          ) : (
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id} className="p-3 border rounded-md bg-gray-50">
                  {editingCategory && editingCategory.id === category.id ? (
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          className="px-3 py-2 border border-gray-300 rounded-md"
                          style={{ backgroundColor: editingCategory.color }}
                        >
                          <span className="sr-only">色を選択</span>
                        </button>
                        {showColorPicker && (
                          <div className="absolute z-10 mt-2 right-0">
                            <HexColorPicker
                              color={editingCategory.color}
                              onChange={(color: string) => setEditingCategory({...editingCategory, color})}
                            />
                            <div className="flex justify-end mt-2">
                              <button
                                type="button"
                                onClick={() => setShowColorPicker(false)}
                                className="px-2 py-1 text-sm text-gray-600 bg-gray-100 rounded"
                              >
                                閉じる
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={saveEditedCategory}
                        className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        保存
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-2 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span>{category.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-blue-600 hover:text-blue-800"
                          disabled={category.isDefault}
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-800"
                          disabled={category.isDefault}
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
} 