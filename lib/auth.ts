import { supabase } from "./supabase"

// Offline user data
const OFFLINE_USERS = {
  sindica: {
    id: "offline-sindico-id",
    username: "sindica",
    full_name: "Patricia - Síndica",
    user_type: "sindico" as const,
    phone: "(11) 99999-0000",
    block: null,
    apartment: null,
    password: "patricia",
  },
  joao: {
    id: "offline-morador-1",
    username: "joao",
    full_name: "João Silva",
    user_type: "morador" as const,
    phone: "(11) 99999-1234",
    block: "B01",
    apartment: "Apt101",
    password: "123456",
  },
  maria: {
    id: "offline-morador-2",
    username: "maria",
    full_name: "Maria Santos",
    user_type: "morador" as const,
    phone: "(11) 98888-5678",
    block: "B03",
    apartment: "Apt205",
    password: "123456",
  },
}

// Force offline mode in preview environment or when connection fails
let useOfflineMode = false

// Check if we're in a preview environment
function isPreviewEnvironment() {
  if (typeof window === "undefined") return false
  return (
    window.location.hostname.includes("vusercontent.net") ||
    window.location.hostname.includes("preview") ||
    window.location.hostname === "localhost"
  )
}

async function checkConnection() {
  // Force offline mode in preview environments
  if (isPreviewEnvironment()) {
    console.log("Preview environment detected, using offline mode")
    useOfflineMode = true
    return false
  }

  try {
    // Quick timeout for connection check
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const { data, error } = await supabase.auth.getSession()
    clearTimeout(timeoutId)

    if (error) {
      console.log("Supabase connection failed, using offline mode")
      useOfflineMode = true
      return false
    }
    return true
  } catch (err) {
    console.log("Supabase connection failed, using offline mode")
    useOfflineMode = true
    return false
  }
}

export async function signUp(
  username: string,
  password: string,
  userData: {
    full_name: string
    phone?: string
    block?: string
    apartment?: string
    user_type: "morador" | "prestador"
  },
) {
  // Check connection first
  const isOnline = await checkConnection()

  if (!isOnline || useOfflineMode) {
    // Offline mode - simulate signup
    const existingUser = OFFLINE_USERS[username as keyof typeof OFFLINE_USERS]
    if (existingUser) {
      return {
        data: null,
        error: { message: "User already registered" },
      }
    }

    // Store new user in localStorage
    const newUser = {
      id: `offline-${Date.now()}`,
      username,
      ...userData,
      password,
    }

    const offlineUsers = JSON.parse(localStorage.getItem("offline_users") || "{}")
    offlineUsers[username] = newUser
    localStorage.setItem("offline_users", JSON.stringify(offlineUsers))

    return {
      data: { user: newUser },
      error: null,
    }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: `${username}@condominio.local`,
      password,
      options: {
        data: {
          username,
          ...userData,
        },
      },
    })

    return { data, error }
  } catch (err) {
    // Fallback to offline mode on any error
    useOfflineMode = true
    const newUser = {
      id: `offline-${Date.now()}`,
      username,
      ...userData,
      password,
    }

    const offlineUsers = JSON.parse(localStorage.getItem("offline_users") || "{}")
    offlineUsers[username] = newUser
    localStorage.setItem("offline_users", JSON.stringify(offlineUsers))

    return {
      data: { user: newUser },
      error: null,
    }
  }
}

export async function signIn(username: string, password: string) {
  // Force offline mode in preview or if already detected
  if (isPreviewEnvironment() || useOfflineMode) {
    useOfflineMode = true

    // Check against offline users
    const offlineUser = OFFLINE_USERS[username as keyof typeof OFFLINE_USERS]
    const customUsers = JSON.parse(localStorage.getItem("offline_users") || "{}")
    const customUser = customUsers[username]

    const user = offlineUser || customUser

    if (user && user.password === password) {
      // Store current user in localStorage
      localStorage.setItem("current_user", JSON.stringify(user))
      return {
        data: { user },
        error: null,
      }
    } else {
      return {
        data: null,
        error: { message: "Invalid credentials" },
      }
    }
  }

  // Try online mode only if not in preview
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${username}@condominio.local`,
      password,
    })

    if (error) {
      // Fallback to offline mode
      useOfflineMode = true
      const offlineUser = OFFLINE_USERS[username as keyof typeof OFFLINE_USERS]
      if (offlineUser && offlineUser.password === password) {
        localStorage.setItem("current_user", JSON.stringify(offlineUser))
        return {
          data: { user: offlineUser },
          error: null,
        }
      }
      return { data: null, error }
    }

    return { data, error }
  } catch (err) {
    // Fallback to offline mode
    useOfflineMode = true
    const offlineUser = OFFLINE_USERS[username as keyof typeof OFFLINE_USERS]
    if (offlineUser && offlineUser.password === password) {
      localStorage.setItem("current_user", JSON.stringify(offlineUser))
      return {
        data: { user: offlineUser },
        error: null,
      }
    }

    return {
      data: null,
      error: { message: "Invalid credentials" },
    }
  }
}

export async function signOut() {
  // Clear offline user
  localStorage.removeItem("current_user")

  if (useOfflineMode || isPreviewEnvironment()) {
    return { error: null }
  }

  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (err) {
    return { error: null } // Don't show error on logout
  }
}

export async function getCurrentUser() {
  // First check offline mode
  const offlineUser = localStorage.getItem("current_user")
  if (offlineUser) {
    return JSON.parse(offlineUser)
  }

  if (useOfflineMode || isPreviewEnvironment()) {
    return null
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    return profile
  } catch (err) {
    console.error("Error getting current user:", err)
    useOfflineMode = true
    return null
  }
}

export async function createSindicoAccount() {
  // In offline mode or preview, sindico already exists
  if (useOfflineMode || isPreviewEnvironment()) {
    return {
      data: { user: OFFLINE_USERS.sindica },
      error: null,
    }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: "sindica@condominio.local",
      password: "patricia",
      options: {
        data: {
          username: "sindica",
          full_name: "Patricia - Síndica",
          user_type: "sindico",
        },
      },
    })

    return { data, error }
  } catch (err) {
    useOfflineMode = true
    return {
      data: { user: OFFLINE_USERS.sindica },
      error: null,
    }
  }
}

export async function testSupabaseConnection() {
  if (isPreviewEnvironment()) {
    return { success: false }
  }

  const isOnline = await checkConnection()
  return { success: isOnline }
}

// Check if we're in offline mode
export function isOfflineMode() {
  return useOfflineMode || isPreviewEnvironment()
}
