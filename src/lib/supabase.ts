import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Opinion {
  id?: number
  topic: string
  content: string
  author: string
  timestamp?: string
  is_auto_classified?: boolean
  created_at?: string
}
