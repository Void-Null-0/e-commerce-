import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const sort = searchParams.get('sort') || 'newest'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const inStock = searchParams.get('inStock')

    const where: Record<string, unknown> = { active: true }

    if (category) {
      const cat = await db.category.findUnique({ where: { slug: category } })
      if (cat) where.categoryId = cat.id
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (featured === 'true') {
      where.featured = true
    }

    if (inStock === 'true') {
      where.stock = { gt: 0 }
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) (where.price as Record<string, unknown>).gte = parseFloat(minPrice)
      if (maxPrice) (where.price as Record<string, unknown>).lte = parseFloat(maxPrice)
    }

    const orderBy: Record<string, string> = {}
    switch (sort) {
      case 'price-asc': orderBy.price = 'asc'; break
      case 'price-desc': orderBy.price = 'desc'; break
      case 'name': orderBy.name = 'asc'; break
      default: orderBy.createdAt = 'desc'
    }

    const products = await db.product.findMany({
      where,
      orderBy,
      include: { category: true },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to fetch products', details: msg }, { status: 500 })
  }
}