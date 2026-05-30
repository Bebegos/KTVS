import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ve anon key tanımlanmadı. .env dosyasını kontrol et.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Yardımcı fonksiyonlar

export async function getFamilyCode(): Promise<string> {
  let code = localStorage.getItem('familyCode')
  if (!code) {
    code = generateFamilyCode()
    localStorage.setItem('familyCode', code)
  }
  return code
}

function generateFamilyCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function getDinos(userId?: string) {
  let query = supabase.from('dinos').select('*')

  if (userId) {
    query = query.eq('owner_id', userId)
  } else {
    // Fallback: family code
    const familyCode = await getFamilyCode()
    query = query.eq('family_code', familyCode)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getDino(id: string) {
  const { data, error } = await supabase
    .from('dinos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createDino(dino: any) {
  const familyCode = await getFamilyCode()
  const { data, error } = await supabase
    .from('dinos')
    .insert([{ ...dino, family_code: familyCode }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateDino(id: string, updates: any) {
  const { data, error } = await supabase
    .from('dinos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteDino(id: string) {
  const { error } = await supabase
    .from('dinos')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getMatches() {
  const familyCode = await getFamilyCode()
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('family_code', familyCode)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createMatch(match: any) {
  const familyCode = await getFamilyCode()
  const { data, error } = await supabase
    .from('matches')
    .insert([{ ...match, family_code: familyCode }])
    .select()
    .single()

  if (error) throw error
  return data
}
