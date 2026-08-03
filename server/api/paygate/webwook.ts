import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || !body.identifier) {
    return { status: 'error', message: 'Payload invalide' }
  }

  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl, 
    config.public.supabaseKey
  )

  if (body.status === 0 || body.status === '0') {
    await supabase
      .from('deposits')
      .update({ status: 'completed' })
      .eq('reference_id', body.identifier)

    return { status: 'ok' }
  }

  await supabase
    .from('deposits')
    .update({ status: 'rejected' })
    .eq('reference_id', body.identifier)

  return { status: 'rejected' }
})