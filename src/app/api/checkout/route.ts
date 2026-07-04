import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const checkoutSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  shippingAddress: z.string().min(5),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
  })),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid order data', details: parsed.error.flatten() }, { status: 400 })
    }

    const { customerName, customerEmail, shippingAddress, items } = parsed.data

    // Check stock availability
    for (const item of items) {
      const product = await db.product.findUnique({ where: { id: item.productId } })
      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${product?.name || item.productId}` },
          { status: 400 }
        )
      }
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase()

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        shippingAddress,
        total,
        status: 'pending',
        items: { create: items },
      },
      include: { items: { include: { product: true } } },
    })

    // Decrease stock
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    return NextResponse.json({ success: true, order, orderNumber })
  } catch (error) {
    console.error('Error processing checkout:', error)
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 })
  }
}