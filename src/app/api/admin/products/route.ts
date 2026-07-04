import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching admin products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, price, comparePrice, image, categoryId, sku, stock, featured } = body

    const existingSku = await db.product.findUnique({ where: { sku } })
    if (existingSku) {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 409 })
    }

    const product = await db.product.create({
      data: { name, description, price, comparePrice, image, categoryId, sku, stock: stock ?? 0, featured: featured ?? false },
      include: { category: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}