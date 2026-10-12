// Ime aplikacije – menja se samo ovde
export const APP_NAME = 'GumeGo'
export const APP_TAGLINE = 'Zamena guma bez odlaska kod vulkanizera'

// Cene u RSD
export const PRICES = {
  twoSetsPerTire: 750, // Paket 1: ima 2 seta felni, zamena na licu mesta
  oneSetPerTire: 1500, // Paket 2: jedan set, prevoz do skladišta, montaža + balansiranje
  storagePerTirePerMonth: 200,
}

export const PACKAGES = {
  twoSets: {
    id: 'twoSets',
    name: 'Imam 2 seta felni',
    pricePerTire: PRICES.twoSetsPerTire,
    description: 'Dolazimo do vašeg auta i menjamo točkove na licu mesta.',
  },
  oneSet: {
    id: 'oneSet',
    name: 'Imam jedan set felni',
    pricePerTire: PRICES.oneSetPerTire,
    description: 'Preuzimamo auto, u našem skladištu prebacujemo gume na felne, balansiramo i vraćamo vam auto.',
  },
}

// Vremenski prozor: od kad je auto dostupan do kad mora biti vraćen
export const WINDOW = {
  firstHour: 7,
  lastHour: 20,
  minHours: { twoSets: 1, oneSet: 2 }, // koliko najmanje sati treba za posao
}

export const hourToTime = (h) => `${String(h).padStart(2, '0')}:00`

// "09:00:00" iz baze → "09:00"; stare rezervacije imaju samo slot
export const windowLabel = (b) => (b.pickup_from ? `${b.pickup_from.slice(0, 5)} – ${b.return_by.slice(0, 5)}` : b.slot)

// Cene se računaju i u bazi (supabase/schema.sql) – ovo je samo za prikaz
export function calcPrice({ packageId, tires, storage, storageMonths }) {
  const service = PACKAGES[packageId].pricePerTire * tires
  const storageMonthly = storage ? PRICES.storagePerTirePerMonth * tires : 0
  const storageTotal = storageMonthly * (storage ? storageMonths : 0)
  return { service, storageMonthly, storageTotal, total: service + storageTotal }
}

export const formatRsd = (n) => `${n.toLocaleString('sr-RS')} RSD`

export const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('sr-Latn-RS', { weekday: 'short', day: 'numeric', month: 'long' })

export const STATUSES = {
  pending: 'Na čekanju',
  confirmed: 'Potvrđeno',
  in_progress: 'U toku',
  done: 'Završeno',
  cancelled: 'Otkazano',
}
