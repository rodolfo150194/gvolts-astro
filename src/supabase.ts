
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.SUPABASE_URL
const supabaseKey = import.meta.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please set SUPABASE_URL and SUPABASE_KEY in your deployment environment.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)