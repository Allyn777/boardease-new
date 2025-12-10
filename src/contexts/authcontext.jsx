import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState('user')
  const [loading, setLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  // Get user profile role
  const getUserRole = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error || !profile) {
        console.error('Error fetching profile:', error)
        return 'user'
      }

      return profile.role || 'user'
    } catch (error) {
      console.error('Error in getUserRole:', error)
      return 'user'
    }
  }

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (error) {
          console.error('Session error:', error)
          setUser(null)
          setUserRole('user')
        } else if (session?.user) {
          const role = await getUserRole(session.user.id)
          if (mounted) {
            setUser(session.user)
            setUserRole(role)
            console.log('User logged in:', session.user.email, 'Role:', role)
          }
        } else {
          setUser(null)
          setUserRole('user')
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        if (mounted) {
          setUser(null)
          setUserRole('user')
        }
      } finally {
        if (mounted) {
          setAuthChecked(true)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('Auth state changed:', event)
        
        if (session?.user) {
          const role = await getUserRole(session.user.id)
          if (mounted) {
            setUser(session.user)
            setUserRole(role)
            console.log('User state updated:', session.user.email, 'Role:', role)
          }
        } else {
          if (mounted) {
            setUser(null)
            setUserRole('user')
          }
        }
        
        if (mounted) {
          setAuthChecked(true)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Sign Up - Create user profile with 'user' role
  const signUp = async (email, password) => {
    try {
      setLoading(true)
      console.log('Signing up user:', email)
      const cleanEmail = email.trim()
      
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: undefined,
        }
      })
      
      if (error) {
        console.error('Signup error:', error)
        throw error
      }
      
      // IMPORTANT: Use upsert to ensure profile is created with 'user' role
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: data.user.id,
              role: 'user',  // UI signups are ALWAYS regular users
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            { 
              onConflict: 'id',
              ignoreDuplicates: false
            }
          )
        
        if (profileError) {
          console.error('Profile creation error:', profileError)
        } else {
          console.log('✅ User profile created with role: user')
        }
      }
      
      console.log('Signup successful, user created:', data.user?.id)
      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // Sign In
  const signIn = async (email, password) => {
    try {
      setLoading(true)
      console.log('Signing in user:', email)
      const cleanEmail = email.trim()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })
      
      if (error) {
        console.error('Signin error:', error)
        throw error
      }
      
      console.log('Signin successful:', data.user?.email)
      
      // Fetch role immediately after login
      let fetchedRole = 'user'
      if (data.user) {
        fetchedRole = await getUserRole(data.user.id)
        setUser(data.user)
        setUserRole(fetchedRole)
        console.log('Login complete - Role:', fetchedRole)
      }
      
      // Return the fetched role, not the state (state might not be updated yet)
      return { data, error: null, role: fetchedRole }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // Sign Out
  const signOut = async () => {
    try {
      setLoading(true)
      setUser(null)
      setUserRole('user')
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      console.log('User signed out successfully')
    } catch (error) {
      console.error('Error signing out:', error)
      setUser(null)
      setUserRole('user')
    } finally {
      setLoading(false)
    }
  }

  // Reset Password
  const resetPassword = async (email) => {
    try {
      setLoading(true)
      const cleanEmail = email.trim()
      const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    userRole,
    loading,
    authChecked,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}