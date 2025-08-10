"use client"

import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import DemoDashboard from "@/components/demo-dashboard"

export default function Dashboard() {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [useDemo, setUseDemo] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        // If no user found, check if we should show demo
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get("demo") === "true") {
          setUseDemo(true)
        } else {
          router.push("/")
          return
        }
      } else {
        setUser(currentUser)
      }
    } catch (error) {
      console.error("Error loading user:", error)
      // On error, show demo dashboard
      setUseDemo(true)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Show demo dashboard if no real user or demo mode
  if (useDemo || !user) {
    return <DemoDashboard />
  }

  return <DashboardLayout />
}
