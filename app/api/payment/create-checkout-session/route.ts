import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getUser } from '@/lib/auth'
import Stripe from 'stripe'
import prisma from '@/lib/db'

const SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRODUCTS = {
  pro_monthly:  { name: 'PRO — Сарын', productId: process.env.STRIPE_PRODUCT_PRO_MONTH, price: 17000 },
  pro_yearly:   { name: 'PRO — Жилийн', productId: process.env.STRIPE_PRODUCT_PRO_YEAR, price: 170000 },
  vip_monthly:  { name: 'VIP — Сарын', productId: process.env.STRIPE_PRODUCT_VIP_MONTH, price: 34000 },
  vip_yearly:   { name: 'VIP — Жилийн', productId: process.env.STRIPE_PRODUCT_VIP_YEAR, price: 320000 },
  contest_pro:  { name: 'Contest — PRO', productId: process.env.STRIPE_PRODUCT_CONTEST_PRO, price: 3000 },
  contest_free: { name: 'Contest — FREE', productId: process.env.STRIPE_PRODUCT_CONTEST_FREE, price: 10000 },
  token_10:     { name: '10 AI Token', productId: process.env.STRIPE_PRODUCT_AI_TOKEN_10, price: 3500 },
  token_50:     { name: '50 AI Token', productId: process.env.STRIPE_PRODUCT_AI_TOKEN_50, price: 15000 },
  token_200:    { name: '200+20 Token', productId: process.env.STRIPE_PRODUCT_AI_TOKEN_200, price: 45000 },
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
    const { item, currency = 'mnt' } = await req.json()
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

    // Currency conversion: MNT to USD (1 USD ≈ 3400 MNT)
    const MNT_TO_USD = 3400
    const amount = currency === 'usd'
      ? Math.round((product.price / MNT_TO_USD) * 100)
      : product.price

    const lineItems = [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: product.name,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ]

    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/payment?success=true&item=${item}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/payment?item=${item}&canceled=true`,
      metadata: {
        userId,
        item,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (e) {
    console.error('Stripe checkout error:', e)
    return NextResponse.json({ error: 'Төлбөр боловсруулахад алдаа' }, { status: 500 })
  }
}
