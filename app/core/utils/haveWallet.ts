import { createClient } from '@supabase/supabase-js'

export const checkUserWallet = async (userId: string): Promise<boolean> => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)

  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) return false
    return !!data 
  } catch (err) {
    return false
  }
}