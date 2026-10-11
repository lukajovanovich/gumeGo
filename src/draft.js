// Nedovršena rezervacija se čuva u browseru, da preživi registraciju i
// preusmeravanje na Google prijavu. Posle prijave šalje je PendingBooking (App.jsx).
import { supabase } from './supabase.js'

const DRAFT_KEY = 'gumego_draft'
const PENDING_KEY = 'gumego_pending'

function read(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key, value) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // privatni prozor ili blokiran storage – forma i dalje radi, samo bez čuvanja
  }
}

export function loadDraft() {
  try {
    return JSON.parse(read(DRAFT_KEY)) || null
  } catch {
    return null
  }
}

export const saveDraft = (form) => write(DRAFT_KEY, JSON.stringify(form))

// Korisnik je kliknuo "Pošalji" pre nego što se prijavio
export const markPending = () => write(PENDING_KEY, '1')
export const isPending = () => read(PENDING_KEY) === '1'
export const clearPending = () => write(PENDING_KEY, null)

export function clearDraft() {
  write(DRAFT_KEY, null)
  write(PENDING_KEY, null)
}

export function submitBooking(userId, form) {
  return supabase.from('bookings').insert({
    user_id: userId,
    package_id: form.packageId,
    tires: form.tires,
    address: form.address.trim(),
    city: form.city.trim(),
    phone: form.phone.trim(),
    note: form.note.trim(),
    date: form.date,
    slot: form.slot,
    storage: form.storage,
    storage_months: form.storage ? form.storageMonths : 0,
  })
}
