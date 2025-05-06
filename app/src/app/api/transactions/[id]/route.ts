import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await prisma.transaction.delete({
      where: {
        id: params.id,
      },
    })
    return NextResponse.json(transaction)
  } catch (error) {
    return NextResponse.json(
      { error: '取引の削除に失敗しました' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const transaction = await prisma.transaction.update({
      where: {
        id: params.id,
      },
      data: {
        type: body.type,
        amount: body.amount,
        date: new Date(body.date),
        category: body.category,
        memo: body.memo,
      },
    })
    return NextResponse.json(transaction)
  } catch (error) {
    return NextResponse.json(
      { error: '取引の更新に失敗しました' },
      { status: 500 }
    )
  }
} 