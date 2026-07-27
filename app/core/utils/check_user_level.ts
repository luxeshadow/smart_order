import { createClient } from '@supabase/supabase-js'

export const checkUserActiveLevel = async (userId: string): Promise<boolean> => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)

  try {
    const { data, error } = await supabase
      .from('users_levels')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (error) return false
    return !!data
  } catch (err) {
    return false
  }
}