import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(url && anonKey)
export const supabase = supabaseConfigured ? createClient(url, anonKey) : null

const ERRORS = {
  'Invalid login credentials': 'Pogrešan email ili lozinka.',
  'User already registered': 'Nalog sa ovom email adresom već postoji.',
  'Email not confirmed': 'Potvrdite email adresu preko linka koji smo vam poslali.',
}

// Prevodi poruke grešaka sa Supabase-a na srpski
export const errorMessage = (error) => ERRORS[error?.message] || error?.message || 'Došlo je do greške. Pokušajte ponovo.'
