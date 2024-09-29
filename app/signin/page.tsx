"use client"

import SignupForm from '../signup-form'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()

  return <SignupForm onBack={() => router.push('/')} />
}