'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Tasks are shown inline inside lesson detail page
// This page just redirects back to lessons
export default function TaskRedirect() {
  const router = useRouter()
  useEffect(() => { router.push('/lessons') }, [])
  return null
}
