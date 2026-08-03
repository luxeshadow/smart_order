// server/api/paygate/webhook.ts
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (body && (body.status === 0 || body.status === '0')) {
    const config = useRuntimeConfig()
    const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)

    await supabase
      .from('deposits')
      .update({ status: 'completed' })
      .eq('reference_id', body.identifier)

    return { status: 'ok' }
  }

  return { status: 'rejected' }
})