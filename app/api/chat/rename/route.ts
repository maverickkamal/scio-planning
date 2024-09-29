import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { chatId, newTitle } = await request.json()

  if (!chatId || !newTitle) {
    return NextResponse.json({ error: 'Chat ID and new title are required' }, { status: 400 })
  }

  await kv.hset(`chat:${chatId}`, { title: newTitle })

  return NextResponse.json({ success: true })
}