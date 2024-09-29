import { NextResponse } from 'next/server'

export async function POST() {
  const chatId = Date.now().toString()
  return NextResponse.json({ id: chatId })
}