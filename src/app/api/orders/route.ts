import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

/**
 * Create an order (checkout).
 * Body: { productId, paymentMethod, customerName?, customerEmail?, notes? }
 */
export async function POST(req: NextRequest) {
  const user = await getSession()
  const body = await req.json().catch(() => null)
  if (!body?.productId) {
    return NextResponse.json({ error: 'product_id_required' }, { status: 400 })
  }

  const product = await db.product.findUnique({ where: { id: body.productId } })
  if (!product || !product.enabled) {
    return NextResponse.json({ error: 'product_unavailable' }, { status: 404 })
  }

  const method: string = ['paypal', 'card', 'manual'].includes(body.paymentMethod)
    ? body.paymentMethod
    : 'manual'

  const settings = await db.paymentSettings.findUnique({ where: { id: 'default' } })
  const taxPercent = settings?.taxPercent ?? 0
  const tax = Math.round(product.price * taxPercent) / 100
  const amount = Math.round((product.price + tax) * 100) / 100

  const order = await db.order.create({
    data: {
      userId: user?.id ?? null,
      productId: product.id,
      productName: product.name,
      amount,
      currency: product.currency,
      paymentMethod: method,
      status: method === 'manual' ? 'pending' : 'pending',
      customerName: body.customerName ?? user?.username ?? null,
      customerEmail: body.customerEmail ?? user?.email ?? null,
      notes: body.notes ?? null,
    },
  })

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    method: order.paymentMethod,
    status: order.status,
  })
}
