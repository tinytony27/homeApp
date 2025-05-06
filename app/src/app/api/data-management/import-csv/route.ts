import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// CSVレコードの型定義
type CsvRecord = {
  type: 'income' | 'expense'
  amount: number
  date: string
  category: string
  memo?: string
}

export async function POST(request: Request) {
  try {
    // multipart/form-dataを解析
    const formData = await request.formData()
    const file = formData.get('file') as File
    const mode = formData.get('mode') as string || 'append'

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが提供されていません' },
        { status: 400 }
      )
    }

    // ファイルの内容を読み込む
    const fileContent = await file.text()
    
    // CSVをパース
    const { records, errors } = parseCSV(fileContent)
    
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'CSVの解析中にエラーが発生しました', details: errors },
        { status: 400 }
      )
    }
    
    if (records.length === 0) {
      return NextResponse.json(
        { error: 'インポートするデータがありません' },
        { status: 400 }
      )
    }

    // 既存データの置き換え（replace モード）
    if (mode === 'replace') {
      await prisma.transaction.deleteMany({})
    }

    // カテゴリをすべて取得
    const incomeCategories = await prisma.category.findMany({
      where: { type: 'income' },
    })

    const expenseCategories = await prisma.category.findMany({
      where: { type: 'expense' },
    })

    // トランザクションの作成
    const createdTransactions = []
    const errorRecords = []

    for (const record of records) {
      try {
        // カテゴリIDの検索
        let categoryId: string | null = null
        
        if (record.type === 'income') {
          const category = incomeCategories.find(c => c.name === record.category)
          categoryId = category?.id || null
        } else {
          const category = expenseCategories.find(c => c.name === record.category)
          categoryId = category?.id || null
        }
        
        // カテゴリが見つからない場合、デフォルトカテゴリを使用
        if (!categoryId) {
          const defaultCategory = await prisma.category.findFirst({
            where: {
              type: record.type,
              name: 'その他',
              isDefault: true
            }
          })
          
          if (!defaultCategory) {
            throw new Error(`カテゴリ "${record.category}" が見つかりません`)
          }
          
          categoryId = defaultCategory.id
        }

        const transaction = await prisma.transaction.create({
          data: {
            type: record.type,
            amount: record.amount,
            date: new Date(record.date),
            categoryId: categoryId,
            memo: record.memo || '',
          },
        })
        createdTransactions.push(transaction)
      } catch (error) {
        console.error('Record import error:', error)
        errorRecords.push({ record, error: (error as Error).message })
      }
    }

    return NextResponse.json({
      success: true,
      imported: createdTransactions.length,
      failed: errorRecords.length,
      errors: errorRecords,
    })
  } catch (error) {
    console.error('CSV Import Error:', error)
    return NextResponse.json(
      { error: 'CSVインポート中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// CSVをパースして配列に変換する関数
function parseCSV(csvContent: string): { records: CsvRecord[], errors: string[] } {
  const lines = csvContent.split('\n')
  const records: CsvRecord[] = []
  const errors: string[] = []
  
  // ヘッダー行を処理
  const headerLine = lines[0]
  if (!headerLine) {
    errors.push('CSVファイルが空です')
    return { records, errors }
  }
  
  const headers = headerLine.split(',')
  
  // 必須ヘッダーの確認
  const requiredHeaders = ['type', 'amount', 'date', 'category']
  for (const requiredHeader of requiredHeaders) {
    if (!headers.includes(requiredHeader)) {
      errors.push(`必須ヘッダー "${requiredHeader}" がありません`)
    }
  }
  
  if (errors.length > 0) {
    return { records, errors }
  }
  
  // データ行を処理
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue // 空行をスキップ
    
    const values = parseCSVLine(line)
    
    if (values.length !== headers.length) {
      errors.push(`行 ${i + 1}: 列数がヘッダーと一致しません (${values.length} != ${headers.length})`)
      continue
    }
    
    try {
      const record: any = {}
      
      // 各フィールドを対応するヘッダーで設定
      headers.forEach((header, index) => {
        record[header] = values[index]
      })
      
      // 型の検証と変換
      if (record.type !== 'income' && record.type !== 'expense') {
        errors.push(`行 ${i + 1}: typeは'income'または'expense'である必要があります`)
        continue
      }
      
      const amount = Number(record.amount)
      if (isNaN(amount)) {
        errors.push(`行 ${i + 1}: amountは数値である必要があります`)
        continue
      }
      record.amount = amount
      
      // 日付の検証
      if (!isValidDate(record.date)) {
        errors.push(`行 ${i + 1}: dateが無効な形式です (YYYY-MM-DD形式が必要)`)
        continue
      }
      
      // memoはオプション
      if (record.memo === undefined) {
        record.memo = ''
      }
      
      records.push(record as CsvRecord)
    } catch (error) {
      errors.push(`行 ${i + 1}: データの解析中にエラーが発生しました - ${(error as Error).message}`)
    }
  }
  
  return { records, errors }
}

// CSVの行を解析する関数 (カンマとクォートを適切に処理)
function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let currentValue = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // エスケープされた引用符
        currentValue += '"'
        i++ // 次の文字をスキップ
      } else {
        // 引用符モードの切り替え
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // フィールドの終わり
      values.push(currentValue)
      currentValue = ''
    } else {
      // 通常の文字
      currentValue += char
    }
  }
  
  // 最後のフィールドを追加
  values.push(currentValue)
  
  return values
}

// 日付文字列が有効かどうかを検証
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false
  
  const date = new Date(dateString)
  return !isNaN(date.getTime())
} 