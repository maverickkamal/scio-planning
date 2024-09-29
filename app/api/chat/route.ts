import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { message, chatId } = await request.json()

  // Generate a unique ID for the message
  const messageId = Date.now().toString()

  // Save the message
  await kv.hset(`chat:${chatId}`, {
    [messageId]: JSON.stringify({ role: 'human', content: message })
  })

  // Simulate AI response
  const aiResponse = `This is a simulated response to: "${message}"`
  const aiMessageId = (Date.now() + 1).toString()

  // Save AI response
  await kv.hset(`chat:${chatId}`, {
    [aiMessageId]: JSON.stringify({ role: 'assistant', content: aiResponse })
  })

  return NextResponse.json({ content: aiResponse })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const chatId = searchParams.get('chatId')

  if (!chatId) {
    return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
  }

  const messages = await kv.hgetall(`chat:${chatId}`)
  const sortedMessages = Object.entries(messages || {})
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([_, value]) => JSON.parse(value as string))

  return NextResponse.json(sortedMessages)
}