import { useEffect, useState, useContext, createContext, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface User {
  id: string
  email?: string
  username?: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<void>
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
        loadUserProfile(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session?.user) {
          loadUserProfile(session.user.id)
        } else {
          setUser(null)
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  async function loadUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUser({
        id: userId,
        email: session?.user?.email,
        username: data?.username,
      })
    } catch (err) {
      console.error('Profile yükleme hatası:', err)
    }
  }

  async function signUp(email: string, password: string, username: string) {
    if (!email || !password || !username) {
      throw new Error('Email, şifre ve kullanıcı adı gerekli')
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
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

    // Profile manuel olarak oluştur — trigger fallback
    try {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        username: username.trim(),
      })

      if (profileError) {
        console.error('Profile insert hatası:', profileError)
        // Eğer profile oluşturulamadıysa (username duplicate, tablo yok, vb)
        // ama auth başarılı olduysa, devam et
        if (profileError.code === '42P01') {
          // Tablo yok
          throw new Error('Supabase veritabanı kurulumı tamamlanmamış. SQL komutlarını çalıştır.')
        }
        if (profileError.code === '23505') {
          // Unique constraint
          throw new Error('Bu kullanıcı adı zaten kullanılıyor')
        }
      }
    } catch (err: any) {
      console.error('Profile oluşturma hatası:', err)
      // Auth başarılı olduysa, profile hatası önemli olmayabilir
      // Ama kullanıcıya bildir
      if (err.message && err.message.includes('Supabase')) {
        throw err
      }
    }
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
