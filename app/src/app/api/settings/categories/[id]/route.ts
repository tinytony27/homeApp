import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// カテゴリ更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()
    const { name, color } = body
    
    // バリデーション
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'カテゴリ名は必須です' },
        { status: 400 }
      )
    }
    
    if (!color) {
      return NextResponse.json(
        { error: '色は必須です' },
        { status: 400 }
      )
    }
    
    // カテゴリが存在するか確認
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })
    
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'カテゴリが見つかりません' },
        { status: 404 }
      )
    }
    
    // デフォルトカテゴリは更新不可
    if (existingCategory.isDefault) {
      return NextResponse.json(
        { error: 'デフォルトカテゴリは編集できません' },
        { status: 403 }
      )
    }
    
    // 同名のカテゴリが存在しないか確認（自分自身は除く）
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name: name.trim(),
        type: existingCategory.type,
        id: { not: id }
      }
    })
    
    if (duplicateCategory) {
      return NextResponse.json(
        { error: '同じ名前のカテゴリが既に存在します' },
        { status: 400 }
      )
    }
    
    // カテゴリ更新
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        color
      }
    })
    
    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('カテゴリ更新エラー:', error)
    return NextResponse.json(
      { error: 'カテゴリの更新中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// カテゴリ削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    // カテゴリが存在するか確認
    const category = await prisma.category.findUnique({
      where: { id }
    })
    
    if (!category) {
      return NextResponse.json(
        { error: 'カテゴリが見つかりません' },
        { status: 404 }
      )
    }
    
    // デフォルトカテゴリは削除不可
    if (category.isDefault) {
      return NextResponse.json(
        { error: 'デフォルトカテゴリは削除できません' },
        { status: 403 }
      )
    }
    
    // カテゴリを使用している取引を確認
    const transactionCount = await prisma.transaction.count({
      where: { categoryId: id }
    })
    
    if (transactionCount > 0) {
      return NextResponse.json(
        { error: `このカテゴリは${transactionCount}件の取引で使用されています。削除する前に、取引のカテゴリを変更してください。` },
        { status: 400 }
      )
    }
    
    // カテゴリ削除
    await prisma.category.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('カテゴリ削除エラー:', error)
    return NextResponse.json(
      { error: 'カテゴリの削除中にエラーが発生しました' },
      { status: 500 }
    )
  }
} 