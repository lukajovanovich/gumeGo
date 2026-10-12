// Pomoćne funkcije za skladište guma: slike, QR link, trajanje čuvanja
import { supabase } from './supabase.js'

export const BUCKET = 'tire-photos'

export const SEASONS = { summer: '☀️ Letnje', winter: '❄️ Zimske' }

// Na jesen se stavljaju zimske, pa se čuvaju letnje (i obrnuto)
export const guessStoredSeason = (date = new Date()) => {
  const m = date.getMonth() + 1
  return m >= 9 || m <= 2 ? 'summer' : 'winter'
}

// Link koji je upisan u QR kod
export const tireSetUrl = (id) => `${window.location.origin}/skladiste/${id}`

// Koji je mesec čuvanja (1 = prvi mesec)
export function storageMonth(storedAt, returnedAt) {
  const start = new Date(`${storedAt}T00:00:00`)
  const end = returnedAt ? new Date(`${returnedAt}T00:00:00`) : new Date()
  let months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth()
  if (end.getDate() < start.getDate()) months--
  return Math.max(months, 0) + 1
}

// Smanjuje sliku sa telefona (često 5+ MB) pre slanja
async function compressImage(file, maxSize = 1600, quality = 0.8) {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    return await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  } catch {
    return file
  }
}

export async function uploadPhotos(setId, files) {
  const paths = []
  for (const [i, file] of [...files].entries()) {
    const blob = await compressImage(file)
    const path = `${setId}/${Date.now()}-${i}.jpg`
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' })
    if (error) throw error
    paths.push(path)
  }
  return paths
}

// Privatne slike se prikazuju preko privremenih linkova (važe 1 sat)
export async function signedPhotoUrls(paths) {
  if (!paths?.length) return {}
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600)
  return Object.fromEntries((data || []).filter((d) => d.signedUrl).map((d) => [d.path, d.signedUrl]))
}

export const formatDay = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('sr-Latn-RS', { day: 'numeric', month: 'short', year: 'numeric' })
