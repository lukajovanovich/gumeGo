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

export const TIME_SLOTS = ['08:00 – 10:00', '10:00 – 12:00', '12:00 – 14:00', '14:00 – 16:00', '16:00 – 18:00']

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
