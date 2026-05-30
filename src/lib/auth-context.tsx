import { useEffect, useState, useContext, createContext, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface User {
  id: string
  email?: string
  username?: string
}

interface SignUpResult {
  needsEmailConfirmation: boolean
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<SignUpResult>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        loadUserProfile(session.user)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session?.user) {
          loadUserProfile(session.user)
        } else {
          setUser(null)
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  // Profili yükle — yoksa otomatik oluştur (self-healing).
  // Trigger olsun olmasın, timing ne olursa olsun profil garanti oluşturulur.
  async function loadUserProfile(authUser: { id: string; email?: string; user_metadata?: any }) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      if (error) {
        console.error('Profile sorgu hatası:', error)
      }

      // Profil yoksa oluştur (metadata'daki username veya email'den türet)
      if (!data) {
        const fallbackUsername =
          authUser.user_metadata?.username ||
          authUser.email?.split('@')[0] ||
          `oyuncu_${authUser.id.slice(0, 8)}`

        const { data: created, error: insertError } = await supabase
          .from('profiles')
          .upsert(
            { id: authUser.id, username: fallbackUsername },
            { onConflict: 'id' }
          )
          .select()
          .maybeSingle()

        if (insertError) {
          console.error('Profile oluşturma hatası (loadUserProfile):', insertError)
        }

        setUser({
          id: authUser.id,
          email: authUser.email,
          username: created?.username || fallbackUsername,
        })
        return
      }

      setUser({
        id: authUser.id,
        email: authUser.email,
        username: data.username,
      })
    } catch (err) {
      console.error('Profile yükleme hatası:', err)
      // En kötü durumda bile kullanıcıyı set et ki uygulama açılsın
      setUser({
        id: authUser.id,
        email: authUser.email,
        username: authUser.user_metadata?.username || authUser.email?.split('@')[0],
      })
    }
  }

  async function signUp(email: string, password: string, username: string) {
    if (!email || !password || !username) {
      throw new Error('Email, şifre ve kullanıcı adı gerekli')
    }

    const trimmedUsername = username.trim()

    // 1. Auth kaydı (username metadata'ya yazılır)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: trimmedUsername,
        },
      },
    })

    if (authError) {
      console.error('Auth signup hatası:', authError)
      throw new Error(`Kayıt hatası: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('Kullanıcı oluşturulamadı')
    }

    // Supabase, mevcut e-posta için identities=[] döner (zaten kayıtlı)
    if (authData.user.identities && authData.user.identities.length === 0) {
      throw new Error('Bu e-posta zaten kayıtlı. Giriş yapmayı dene.')
    }

    // 2. Profili oluştur (upsert — idempotent, trigger olsa da çakışmaz)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        { id: authData.user.id, username: trimmedUsername },
        { onConflict: 'id' }
      )

    if (profileError) {
      console.error('Profile insert hatası:', profileError)
      if (profileError.code === '42P01') {
        throw new Error('Veritabanı kurulumu eksik. SUPABASE_SETUP.sql komutlarını çalıştır.')
      }
      if (profileError.code === '23505') {
        throw new Error('Bu kullanıcı adı zaten kullanılıyor')
      }
      // Diğer profil hataları auth'u engellemez ama bilgilendir
      throw new Error(`Profil oluşturulamadı: ${profileError.message}`)
    }

    // 3. Oturum varsa (email onayı kapalı) kullanıcıyı hemen set et
    if (authData.session?.user) {
      await loadUserProfile(authData.session.user)
      return { needsEmailConfirmation: false }
    }

    // Oturum yok — email onayı açık, kullanıcı e-postasını onaylamalı
    return { needsEmailConfirmation: true }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
