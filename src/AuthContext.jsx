import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined = još se učitava
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(undefined)
  const userId = session?.user.id

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      return
    }
    setProfile(undefined)
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data }) => setProfile(data || null))
  }, [userId])

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    isAdmin: Boolean(profile?.is_admin),
    loading: session === undefined || (Boolean(session) && profile === undefined),
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
