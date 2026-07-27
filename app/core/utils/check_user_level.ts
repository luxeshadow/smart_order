export const checkUserActiveLevel = async (supabase: any, userId: string): Promise<boolean> => {
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