import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ve anon key tanımlanmadı. .env dosyasını kontrol et.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Yardımcı fonksiyonlar

function mapDinoData(data: any): any {
  if (!data) return data

  const transform = (item: any) => ({
    ...item,
    maxHp: item.max_hp,
    abilityIds: item.ability_ids || [],
    pendingRewards: item.pending_rewards ? {
      unspentStatPoints: item.pending_rewards.unspent_stat_points || 0,
      pendingAbilityIds: item.pending_rewards.pending_ability_ids || [],
      pendingAbilitySlot: item.pending_rewards.pending_ability_slot,
    } : undefined,
  })

  if (Array.isArray(data)) {
    return data.map(transform)
  }
  return transform(data)
}

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
  return mapDinoData(data) || []
}

export async function getDino(id: string) {
  const { data, error } = await supabase
    .from('dinos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return mapDinoData(data)
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

// Duello Vs Session Management
export async function createDuelloSession(sessionId: string, hostDinoId: string, hostPlayerId: string) {
  const { data, error } = await supabase
    .from('duello_sessions')
    .insert([{
      session_id: sessionId,
      host_dino_id: hostDinoId,
      host_player_id: hostPlayerId,
      guest_dino_id: null,
      guest_player_id: null,
      status: 'waiting', // waiting, ready, in_progress, completed
      created_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getDuelloSession(sessionId: string) {
  const { data, error } = await supabase
    .from('duello_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (error) throw error
  return data
}

export async function joinDuelloSession(sessionId: string, guestDinoId: string, guestPlayerId: string) {
  const { data, error } = await supabase
    .from('duello_sessions')
    .update({
      guest_dino_id: guestDinoId,
      guest_player_id: guestPlayerId,
      status: 'ready'
    })
    .eq('session_id', sessionId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function subscribeToDuelloSession(sessionId: string, callback: (session: any) => void) {
  const subscription = supabase
    .channel(`duello_session:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'duello_sessions',
        filter: `session_id=eq.${sessionId}`
      },
      (payload) => {
        callback(payload.new)
      }
    )
    .subscribe()

  return subscription
}

// Add XP to dino
export async function addXpToDino(dinoId: string, xpAmount: number) {
  const { data: dino, error: fetchError } = await supabase
    .from('dinos')
    .select('*')
    .eq('id', dinoId)
    .single()

  if (fetchError) throw fetchError

  let newXp = (dino.xp || 0) + xpAmount
  let newLevel = dino.level || 1

  // Check for level ups with dynamic XP requirements
  // XP needed = 100 * level^1.5
  while (true) {
    const xpNeeded = Math.floor(100 * Math.pow(newLevel, 1.5))
    if (newXp >= xpNeeded) {
      newLevel += 1
      newXp -= xpNeeded
    } else {
      break
    }
  }

  const { error: updateError } = await supabase
    .from('dinos')
    .update({ xp: newXp, level: newLevel })
    .eq('id', dinoId)

  if (updateError) throw updateError

  return { newLevel, newXp }
}

// Record Düello VS match result
export async function recordDuelloMatch(
  sessionId: string,
  hostDinoId: string,
  guestDinoId: string,
  winnerDinoId: string
) {
  const familyCode = await getFamilyCode()

  const { error } = await supabase
    .from('matches')
    .insert([{
      session_id: sessionId,
      dino_1_id: hostDinoId,
      dino_2_id: guestDinoId,
      winner_id: winnerDinoId,
      match_type: 'duello_vs',
      family_code: familyCode,
      created_at: new Date().toISOString()
    }])

  if (error) throw error
}

// Mark session as abandoned
export async function abandonDuelloSession(sessionId: string) {
  const { error } = await supabase
    .from('duello_sessions')
    .update({ status: 'abandoned' })
    .eq('session_id', sessionId)

  if (error) throw error
}

// ===== DINO COIN SYSTEM =====

export async function getUserCoins(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_coins')
    .select('coins')
    .eq('user_id', userId)
    .single()

  if (error) {
    // If no record exists, create one with 0 coins
    if (error.code === 'PGRST116') {
      const { data: newRecord, error: createError } = await supabase
        .from('user_coins')
        .insert([{ user_id: userId, coins: 0 }])
        .select()
        .single()

      if (createError) throw createError
      return newRecord?.coins ?? 0
    }
    throw error
  }

  return data?.coins ?? 0
}

export async function addCoinsToUser(userId: string, coinsAmount: number): Promise<number> {
  const currentCoins = await getUserCoins(userId)
  const newTotal = currentCoins + coinsAmount

  const { data, error } = await supabase
    .from('user_coins')
    .update({ coins: newTotal })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data?.coins ?? newTotal
}

export async function subtractCoinsFromUser(userId: string, coinsAmount: number): Promise<number> {
  const currentCoins = await getUserCoins(userId)
  const newTotal = Math.max(0, currentCoins - coinsAmount)

  const { data, error } = await supabase
    .from('user_coins')
    .update({ coins: newTotal })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data?.coins ?? newTotal
}
