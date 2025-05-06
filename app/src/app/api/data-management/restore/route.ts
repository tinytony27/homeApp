import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    // multipart/form-dataを解析
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが提供されていません' },
        { status: 400 }
      )
    }

    // ファイルの内容を読み込む
    const fileContent = await file.text()
    
    // JSONをパース
    let backupData
    try {
      backupData = JSON.parse(fileContent)
    } catch (err) {
      return NextResponse.json(
        { error: '無効なJSONファイルです' },
        { status: 400 }
      )
    }
    
    // バージョンチェック
    if (!backupData.version || !backupData.transactions) {
      return NextResponse.json(
        { error: '無効なバックアップファイル形式です' },
        { status: 400 }
      )
    }
    
    // トランザクションデータがあることを確認
    if (!Array.isArray(backupData.transactions) || backupData.transactions.length === 0) {
      return NextResponse.json(
        { error: '復元するトランザクションデータがありません' },
        { status: 400 }
      )
    }

    // トランザクションを使用してすべての操作を実行
    const result = await prisma.$transaction(async (tx) => {
      let categoryMap = new Map()
      
      // カテゴリを復元（新しいバックアップ形式の場合）
      if (Array.isArray(backupData.categories) && backupData.categories.length > 0) {
        // 既存のデフォルトでないカテゴリを削除
        await tx.category.deleteMany({
          where: { isDefault: false }
        })
        
        // カテゴリを復元し、古いIDと新しいIDのマッピングを作成
        for (const category of backupData.categories) {
          // デフォルトカテゴリは上書きしない
          if (category.isDefault) {
            const existingCategory = await tx.category.findFirst({
              where: {
                name: category.name,
                type: category.type,
                isDefault: true
              }
            })
            
            if (existingCategory) {
              categoryMap.set(category.id, existingCategory.id)
              continue
            }
          }
          
          // 新しいカテゴリを作成またはデフォルトカテゴリが見つからない場合
          try {
            const newCategory = await tx.category.upsert({
              where: {
                id: category.id
              },
              update: {
                name: category.name,
                type: category.type,
                color: category.color,
                icon: category.icon,
                isDefault: category.isDefault
              },
              create: {
                name: category.name,
                type: category.type,
                color: category.color || '#3B82F6',
                icon: category.icon,
                isDefault: category.isDefault
              }
            })
            
            categoryMap.set(category.id, newCategory.id)
          } catch (err) {
            console.error('カテゴリの復元エラー:', err)
            // エラーが発生しても続行
          }
        }
      }
      
      // 既存のトランザクションをクリア
      await tx.transaction.deleteMany({})
      
      // トランザクションデータを復元
      const restoredTransactions = []
      
      for (const transaction of backupData.transactions) {
        try {
          // 日付文字列が保存されている場合はDateオブジェクトに変換
          if (typeof transaction.date === 'string') {
            transaction.date = new Date(transaction.date)
          }
          
          // 新しい形式と古い形式の両方に対応
          let categoryId = null
          
          if (transaction.categoryId) {
            // 新しい形式: categoryIdフィールドがある
            categoryId = categoryMap.get(transaction.categoryId) || transaction.categoryId
          } else if (transaction.category) {
            if (typeof transaction.category === 'string') {
              // 古い形式: categoryフィールドが文字列
              // デフォルトカテゴリを探す
              const defaultCategory = await tx.category.findFirst({
                where: {
                  type: transaction.type,
                  name: 'その他',
                  isDefault: true
                }
              })
              categoryId = defaultCategory?.id
            } else if (transaction.category.id) {
              // カテゴリオブジェクトの場合
              categoryId = categoryMap.get(transaction.category.id) || transaction.category.id
            }
          }
          
          // カテゴリIDが見つからない場合、デフォルトカテゴリを使用
          if (!categoryId) {
            const defaultCategory = await tx.category.findFirst({
              where: {
                type: transaction.type,
                name: 'その他',
                isDefault: true
              }
            })
            
            if (!defaultCategory) {
              throw new Error('デフォルトカテゴリが見つかりません')
            }
            
            categoryId = defaultCategory.id
          }
          
          const restored = await tx.transaction.create({
            data: {
              type: transaction.type,
              amount: transaction.amount,
              date: transaction.date,
              categoryId: categoryId,
              memo: transaction.memo || '',
              createdAt: new Date(transaction.createdAt || new Date()),
              updatedAt: new Date(transaction.updatedAt || new Date()),
            },
          })
          
          restoredTransactions.push(restored)
        } catch (error) {
          console.error('Transaction restore error:', error)
          // エラーが発生しても続行
        }
      }
      
      return {
        success: true,
        count: restoredTransactions.length,
      }
    })
    
    return NextResponse.json({
      success: true,
      message: `${result.count}件のトランザクションを復元しました`,
    })
  } catch (error) {
    console.error('Restore Error:', error)
    return NextResponse.json(
      { error: 'バックアップの復元中にエラーが発生しました' },
      { status: 500 }
    )
  }
} 