import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import { APP_NAME, PACKAGES, PRICES, formatRsd } from '../config.js'

const STEPS = [
  { icon: '📅', title: 'Zakažete online', text: 'Izaberete paket, ostavite adresu na kojoj je auto i period kada vam odgovara.' },
  { icon: '🚗', title: 'Mi dolazimo', text: 'Dolazimo do vašeg auta, kod kuće ili ispred posla. Vi ne morate da budete tu.' },
  { icon: '🛞', title: 'Gume su zamenjene', text: 'Menjamo gume na licu mesta ili u našem skladištu i vraćamo auto na isto mesto.' },
]

const FAQ = [
  {
    q: 'Da li moram da budem prisutan?',
    a: 'Ne morate. Dovoljno je da nam u napomeni napišete gde je auto i kako da dođemo do ključa.',
  },
  {
    q: 'Koji paket da izaberem?',
    a: 'Ako su vam i letnje i zimske gume na svojim felnama, izaberite paket sa 2 seta felni i menjamo ih na licu mesta. Ako imate jedan set felni, gume moraju da se prebace sa felne na felnu, pa auto vozimo u naše skladište gde imamo mašinu za to.',
  },
  {
    q: 'Kako funkcioniše čuvanje guma?',
    a: `Gume koje skinemo možemo da čuvamo kod nas do sledeće sezone, za ${formatRsd(PRICES.storagePerTirePerMonth)} po gumi mesečno. Kada dođe vreme za sledeću zamenu, gume su već kod nas.`,
  },
  {
    q: 'Kako se plaća?',
    a: 'Plaćate tek kada je usluga završena.',
  },
  {
    q: 'Mogu li da otkažem rezervaciju?',
    a: 'Možete, dok je na čekanju, na stranici Moje rezervacije.',
  },
]

export default function About() {
  return (
    <AppLayout>
      <section className="card about-hero">
        <h1>Gume menjamo mi, a vi ne morate nigde da idete</h1>
        <p>
          {APP_NAME} je mobilna usluga zamene guma. Umesto da čekate u redu kod vulkanizera, zakažete online, a mi dolazimo
          do vašeg auta. Ako nemate gde da držite gume, čuvamo ih za vas do sledeće sezone.
        </p>
        <Link to="/" className="btn-primary btn-inline">Zakaži zamenu</Link>
      </section>

      <h2 className="section-title">Kako funkcioniše</h2>
      <div className="about-steps">
        {STEPS.map((s, i) => (
          <div key={s.title} className="card about-step">
            <span className="about-icon" aria-hidden="true">{s.icon}</span>
            <h3>{i + 1}. {s.title}</h3>
            <p className="muted">{s.text}</p>
          </div>
        ))}
      </div>

      <h2 className="section-title">Usluge i cene</h2>
      <div className="about-prices">
        {Object.values(PACKAGES).map((p) => (
          <div key={p.id} className="card about-price">
            <h3>{p.name}</h3>
            <p className="package-price">{formatRsd(p.pricePerTire)} <small>/ guma</small></p>
            <p className="muted">{p.description}</p>
          </div>
        ))}
        <div className="card about-price">
          <h3>Čuvanje guma</h3>
          <p className="package-price">{formatRsd(PRICES.storagePerTirePerMonth)} <small>/ guma mesečno</small></p>
          <p className="muted">Gume čuvamo u suvom i bezbednom skladištu do sledeće sezone.</p>
        </div>
      </div>

      <h2 className="section-title">Česta pitanja</h2>
      <div className="card faq">
        {FAQ.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p className="muted">{f.a}</p>
          </details>
        ))}
      </div>
    </AppLayout>
  )
}
