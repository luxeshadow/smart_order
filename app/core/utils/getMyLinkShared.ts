import { createClient } from '@supabase/supabase-js'

export const getMyLinkShared = async (
  userId: string
): Promise<string | null> => {

  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )

  try {

    const { data, error } = await supabase
      .from('users')
      .select('parent_link')
      .eq('id', userId)
      .single()

    if (error || !data?.parent_link) {
      return null
    }

    // URL de partage
    return `${window.location.origin}/auth/register?ref=${data.parent_link}`

  } catch (err) {
    return null
  }
}