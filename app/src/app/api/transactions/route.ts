import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        date: 'desc',
      },
      include: {
        category: true,
      },
    })
    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: '取引の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // バリデーション
    if (!body.type || !body.amount || !body.date || !body.categoryId) {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      )
    }

    // 数値のバリデーション
    const amount = Number(body.amount)
    if (isNaN(amount)) {
      return NextResponse.json(
        { error: '金額は数値で入力してください' },
        { status: 400 }
      )
    }

    // カテゴリの存在確認
    const category = await prisma.category.findUnique({
      where: {
        id: body.categoryId,
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: '指定されたカテゴリが見つかりません' },
        { status: 404 }
      )
    }

    const transaction = await prisma.transaction.create({
      data: {
        type: body.type,
        amount: amount,
        date: new Date(body.date),
        categoryId: body.categoryId,
        memo: body.memo || '',
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: '取引の登録に失敗しました' },
      { status: 500 }
    )
  }
} 