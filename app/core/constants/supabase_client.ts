import { createClient } from '@supabase/supabase-js'

export const useApi = () => {
  const config = useRuntimeConfig()
  
  const supabaseUrl = config.public.supabaseUrl as string
  const supabaseKey = config.public.supabaseKey as string

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or Key is missing in RuntimeConfig")
  }

  return createClient(supabaseUrl, supabaseKey)
}