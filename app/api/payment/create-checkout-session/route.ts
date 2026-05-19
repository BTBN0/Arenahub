import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getUser } from '@/lib/auth'
import Stripe from 'stripe'
import prisma from '@/lib/db'

const SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-15',
})

const PRODUCTS = {
  pro_monthly:  { name: 'PRO — Сарын', productId: process.env.STRIPE_PRODUCT_PRO_MONTH, price: 1700 },
  pro_yearly:   { name: 'PRO — Жилийн', productId: process.env.STRIPE_PRODUCT_PRO_YEAR, price: 17000 },
  vip_monthly:  { name: 'VIP — Сарын', productId: process.env.STRIPE_PRODUCT_VIP_MONTH, price: 3400 },
  vip_yearly:   { name: 'VIP — Жилийн', productId: process.env.STRIPE_PRODUCT_VIP_YEAR, price: 32000 },
  contest_pro:  { name: 'Contest — PRO', productId: process.env.STRIPE_PRODUCT_CONTEST_PRO, price: 300 },
  contest_free: { name: 'Contest — FREE', productId: process.env.STRIPE_PRODUCT_CONTEST_FREE, price: 1000 },
  token_10:     { name: '10 AI Token', productId: process.env.STRIPE_PRODUCT_AI_TOKEN_10, price: 350 },
  token_50:     { name: '50 AI Token', productId: process.env.STRIPE_PRODUCT_AI_TOKEN_50, price: 1500 },
  token_200:    { name: '200+20 Token', productId: process.env.STRIPE_PRODUCT_AI_TOKEN_200, price: 4500 },
}

export async function POST(req: NextRequest) {
  let userId: string | undefined
  let userEmail: string | undefined

  const naToken = await getToken({ req, secret: SECRET })
  if (naToken?.id) {
    userId = naToken.id as string
    userEmail = naToken.email as string
  } else if (naToken?.email) {
    const u = await prisma.user.findUnique({
      where: { email: naToken.email as string },
      select: { id: true, email: true },
    })
    userId = u?.id
    userEmail = u?.email
  }

  if (!userId) {
    const bearer = getUser(req)
    if (bearer?.id) userId = bearer.id
  }

  if (!userId || !userEmail) {
    return NextResponse.json({ error: 'Нэвтрээгүй байна' }, { status: 401 })
  }

  try {
    const { item } = await req.json()
    const product = PRODUCTS[item as keyof typeof PRODUCTS]

    if (!product) {
      return NextResponse.json({ error: 'Мэдэгдэхгүй item' }, { status: 400 })
    }

    if (!product.productId) {
      return NextResponse.json(
        { error: 'Stripe Product ID-г тохируулаагүй байна' },
        { status: 500 }
      )
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'jpy',
          product_data: {
            name: product.name,
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: 1,
      },
    ]

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer_email: userEmail,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/payment?success=true&item=${item}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/payment?item=${item}&canceled=true`,
      metadata: {
        userId,
        item,
      },
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (e) {
    console.error('Stripe checkout error:', e)
    return NextResponse.json({ error: 'Төлбөр боловсруулахад алдаа' }, { status: 500 })
  }
}
