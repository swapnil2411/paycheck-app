import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabaseClient } from '../../services/supabaseClient.jsx'

const Confirming = () => {
  const navigate = useNavigate()

  useEffect(() => {
    supabaseClient.auth.getSession().then(() => {
      navigate('/')
    })
  }, [])

  return <p>Confirming your email…</p>
}

export default Confirming
