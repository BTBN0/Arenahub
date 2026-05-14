'use client'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'

export default function SidebarWrapper() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null
  return <Sidebar />
}