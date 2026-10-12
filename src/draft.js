// Nedovršena rezervacija se čuva u browseru, da preživi registraciju i
// preusmeravanje na Google prijavu. Posle prijave šalje je PendingBooking (App.jsx).
import { supabase } from './supabase.js'
import { hourToTime } from './config.js'

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

export const EMPTY_FORM = {
  packageId: 'twoSets',
  tires: 4,
  carId: '',
  address: '',
  city: 'Beograd',
  phone: '',
  note: '',
  date: '',
  pickupFrom: 9,
  returnBy: 17,
  storage: false,
  storageMonths: 6,
}

// Spaja sa podrazumevanim vrednostima, da i stari sačuvani nacrti imaju sva polja
export function loadDraft() {
  try {
    const draft = JSON.parse(read(DRAFT_KEY))
    return draft ? { ...EMPTY_FORM, ...draft } : null
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
    pickup_from: hourToTime(form.pickupFrom),
    return_by: hourToTime(form.returnBy),
    car_id: form.carId || null,
    storage: form.storage,
    storage_months: form.storage ? form.storageMonths : 0,
  })
}
