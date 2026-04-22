import { createClient } from '@supabase/supabase-js'

export const countPendingWithdrawals = async (): Promise<number> => {
  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )

  try {
    const { data, error } = await supabase
      .rpc('count_pending_withdrawals')

    if (error) return 0

    return data || 0
  } catch (err) {
    return 0
  }
}