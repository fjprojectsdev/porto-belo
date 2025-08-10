"use client"
import SetupHelper from "./setup-helper"

export default function ConfigCheck() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const hasConfig = supabaseUrl && supabaseAnonKey

  if (hasConfig) {
    return null // Don't render anything if config is present
  }

  return <SetupHelper />
}
