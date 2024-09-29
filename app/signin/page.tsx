"use client"

import SigninForm from '../signin-form'
import { useRouter } from 'next/navigation'

export default function SigninPage() {
  const router = useRouter()

  return <SigninForm onBack={() => router.push('/')} />
}