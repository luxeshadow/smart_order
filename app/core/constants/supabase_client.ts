import { createClient } from '@supabase/supabase-js'

let supabaseInstance: ReturnType<typeof createClient> | null = null

export const useApi = () => {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl as string
  const supabaseKey = config.public.supabaseKey as string

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or Key is missing in RuntimeConfig")
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey)

  return supabaseInstance
}