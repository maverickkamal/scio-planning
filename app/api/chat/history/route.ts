import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function GET() {
  const chatIds = await kv.keys('chat:*')
  const chatHistory = await Promise.all(
    chatIds.map(async (id) => {
      const messages = await kv.hgetall(id)
      const lastMessage = Object.values(messages || {}).pop()
      return {
        id: id.replace('chat:', ''),
        title: `Chat ${id.replace('chat:', '')}`,
        lastMessage: lastMessage ? JSON.parse(lastMessage as string).content : '',
        timestamp: new Date().toISOString()
      }
    })
  )

  return NextResponse.json(chatHistory)
}