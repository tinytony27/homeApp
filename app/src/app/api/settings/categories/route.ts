import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// カテゴリ一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'income' | 'expense'
    
    if (!type || (type !== 'income' && type !== 'expense')) {
      return NextResponse.json(
        { error: 'typeパラメータは「income」または「expense」である必要があります' },
        { status: 400 }
      )
    }
    
    const categories = await prisma.category.findMany({
      where: { type },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    })
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error('カテゴリ取得エラー:', error)
    return NextResponse.json(
      { error: 'カテゴリの取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 新規カテゴリ作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, color } = body
    
    // バリデーション
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'カテゴリ名は必須です' },
        { status: 400 }
      )
    }
    
    if (!type || (type !== 'income' && type !== 'expense')) {
      return NextResponse.json(
        { error: 'typeは「income」または「expense」である必要があります' },
        { status: 400 }
      )
    }
    
    if (!color) {
      return NextResponse.json(
        { error: '色は必須です' },
        { status: 400 }
      )
    }
    
    // 同名のカテゴリが存在しないか確認
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: name.trim(),
        type
      }
    })
    
    if (existingCategory) {
      return NextResponse.json(
        { error: '同じ名前のカテゴリが既に存在します' },
        { status: 400 }
      )
    }
    
    // カテゴリ作成
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        type,
        color,
        isDefault: false
      }
    })
    
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('カテゴリ作成エラー:', error)
    return NextResponse.json(
      { error: 'カテゴリの作成中にエラーが発生しました' },
      { status: 500 }
    )
  }
} 