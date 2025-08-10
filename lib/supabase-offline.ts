// Offline-first Supabase wrapper
import { supabase } from "./supabase"
import { isOfflineMode } from "./auth"
import { getOfflineData, addOfflineItem, updateOfflineItem, deleteOfflineItem } from "./offline-data"

// Check if we're in a preview environment
function isPreviewEnvironment() {
  if (typeof window === "undefined") return false
  return (
    window.location.hostname.includes("vusercontent.net") ||
    window.location.hostname.includes("preview") ||
    window.location.hostname === "localhost"
  )
}

export class OfflineSupabase {
  async from(table: string) {
    return new OfflineQuery(table)
  }
}

class OfflineQuery {
  private table: string
  private selectFields = "*"
  private whereConditions: any[] = []
  private orderBy: { column: string; ascending: boolean } | null = null
  private limitCount: number | null = null

  constructor(table: string) {
    this.table = table
  }

  select(fields = "*") {
    this.selectFields = fields
    return this
  }

  eq(column: string, value: any) {
    this.whereConditions.push({ column, operator: "eq", value })
    return this
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    this.orderBy = { column, ascending: options.ascending !== false }
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  async single() {
    const result = await this.execute()
    if (result.error) return result
    return {
      data: result.data?.[0] || null,
      error: null,
    }
  }

  async insert(data: any) {
    // Always use offline mode in preview environment
    if (isOfflineMode() || isPreviewEnvironment()) {
      const newItem = {
        ...data,
        id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const newData = addOfflineItem(this.table as any, newItem)
      return {
        data: newItem,
        error: null,
      }
    }

    try {
      return await supabase.from(this.table).insert(data)
    } catch (error) {
      // Fallback to offline
      const newItem = {
        ...data,
        id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      addOfflineItem(this.table as any, newItem)
      return {
        data: newItem,
        error: null,
      }
    }
  }

  async update(data: any) {
    if (isOfflineMode() || isPreviewEnvironment()) {
      // For offline mode, we need the ID from where conditions
      const idCondition = this.whereConditions.find((c) => c.column === "id")
      if (idCondition) {
        const updatedData = {
          ...data,
          updated_at: new Date().toISOString(),
        }
        updateOfflineItem(this.table as any, idCondition.value, updatedData)
        return {
          data: updatedData,
          error: null,
        }
      }
    }

    try {
      let query = supabase.from(this.table).update(data)

      // Apply where conditions
      for (const condition of this.whereConditions) {
        if (condition.operator === "eq") {
          query = query.eq(condition.column, condition.value)
        }
      }

      return await query
    } catch (error) {
      return {
        data: null,
        error: { message: "Update failed" },
      }
    }
  }

  async delete() {
    if (isOfflineMode() || isPreviewEnvironment()) {
      const idCondition = this.whereConditions.find((c) => c.column === "id")
      if (idCondition) {
        deleteOfflineItem(this.table as any, idCondition.value)
        return {
          data: null,
          error: null,
        }
      }
    }

    try {
      let query = supabase.from(this.table).delete()

      // Apply where conditions
      for (const condition of this.whereConditions) {
        if (condition.operator === "eq") {
          query = query.eq(condition.column, condition.value)
        }
      }

      return await query
    } catch (error) {
      return {
        data: null,
        error: { message: "Delete failed" },
      }
    }
  }

  private async execute() {
    if (isOfflineMode() || isPreviewEnvironment()) {
      let data = getOfflineData(this.table as any)

      // Apply where conditions
      for (const condition of this.whereConditions) {
        if (condition.operator === "eq") {
          data = data.filter((item: any) => item[condition.column] === condition.value)
        }
      }

      // Apply ordering
      if (this.orderBy) {
        data.sort((a: any, b: any) => {
          const aVal = a[this.orderBy!.column]
          const bVal = b[this.orderBy!.column]

          if (this.orderBy!.ascending) {
            return aVal > bVal ? 1 : -1
          } else {
            return aVal < bVal ? 1 : -1
          }
        })
      }

      // Apply limit
      if (this.limitCount) {
        data = data.slice(0, this.limitCount)
      }

      return {
        data,
        error: null,
      }
    }

    try {
      let query = supabase.from(this.table).select(this.selectFields)

      // Apply where conditions
      for (const condition of this.whereConditions) {
        if (condition.operator === "eq") {
          query = query.eq(condition.column, condition.value)
        }
      }

      // Apply ordering
      if (this.orderBy) {
        query = query.order(this.orderBy.column, { ascending: this.orderBy.ascending })
      }

      // Apply limit
      if (this.limitCount) {
        query = query.limit(this.limitCount)
      }

      return await query
    } catch (error) {
      // Fallback to offline data
      let data = getOfflineData(this.table as any)

      // Apply where conditions
      for (const condition of this.whereConditions) {
        if (condition.operator === "eq") {
          data = data.filter((item: any) => item[condition.column] === condition.value)
        }
      }

      return {
        data,
        error: null,
      }
    }
  }
}

export const offlineSupabase = new OfflineSupabase()
