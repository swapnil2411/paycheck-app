import { createContext, useContext, useEffect, useState } from 'react'
import { supabaseClient } from '../../services/supabaseClient'
import { useLoader } from '../loaderContext/LoaderContext.jsx'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // 🔥 important
const [session, setSession] = useState(null);
const [loading, setLoading] = useState(true);



  // 🔹 Restore session
  useEffect(() => {
  let mounted = true;

  const initAuth = async () => {
    try {
      const { data } = await supabaseClient.auth.getSession();

      if (!mounted) return;

      setSession(data.session);
      setUser(data.session?.user ?? null);
    } finally {
      if (mounted) setLoading(false); // 🔥 ALWAYS runs
    }
  };

  initAuth();

  const { data: authListener } =
    supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
    });

  return () => {
    mounted = false;
    authListener.subscription.unsubscribe();
  };
}, []);



  // 🔐 SIGN UP
  const signUp = async (email, password, firstName, lastName) => {
    //startLoader()

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
    })

    //stopLoader()

    if (error) throw error
    return data
  }

  // 🔐 SIGN IN
  const signIn = async (email, password) => {
    //startLoader()

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    //stopLoader()

    if (error) throw error
    return data
  }

  // 🔓 LOGOUT
  const signOut = async () => {
    //startLoader()
    await supabaseClient.auth.signOut()
    setUser(null)
    setSession(null)
    //stopLoader()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        signUp,
        signIn,
        signOut,
        loading, // ✅ ADD THIS
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
