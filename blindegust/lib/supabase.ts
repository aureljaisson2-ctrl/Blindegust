import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, key)

export function makeCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export function makeHostKey() {
  return crypto.randomUUID()
}
