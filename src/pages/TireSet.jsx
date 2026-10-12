import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import AppLayout from '../components/AppLayout.jsx'
import { useAuth } from '../AuthContext.jsx'
import { errorMessage, supabase } from '../supabase.js'
import { BUCKET, SEASONS, formatDay, signedPhotoUrls, storageMonth, tireSetUrl, uploadPhotos } from '../tireSets.js'

const SELECT = '*, profiles(full_name, phone, email), cars(make_model, plate, tire_size)'

function EditForm({ set, onSave }) {
  const [fields, setFields] = useState({
    season: set.season,
    tires: set.tires,
    description: set.description,
    location: set.location,
    note: set.note,
  })
  const [busy, setBusy] = useState(false)
  const update = (e) => setFields({ ...fields, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    await onSave({ ...fields, tires: Number(fields.tires) })
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="card form">
      <h2 className="card-title">Podaci o gumama</h2>
      <div className="row">
        <label>
          Sezona
          <select name="season" value={fields.season} onChange={update}>
            {Object.entries(SEASONS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </label>
        <label>
          Broj guma
          <select name="tires" value={fields.tires} onChange={update}>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>
      <label>
        <span>Opis <span className="optional">(marka, dimenzija, stanje)</span></span>
        <input name="description" value={fields.description} onChange={update} placeholder="npr. Michelin 205/55 R16, šara 5 mm, sa felnama" />
      </label>
      <label>
        <span>Mesto u skladištu</span>
        <input name="location" value={fields.location} onChange={update} placeholder="npr. Polica B, red 3" />
      </label>
      <label>
        <span>Napomena <span className="optional">(vidi i vlasnik)</span></span>
        <textarea name="note" value={fields.note} onChange={update} rows="2" />
      </label>
      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Čuvam…' : 'Sačuvaj'}</button>
      </div>
    </form>
  )
}

export default function TireSet() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [set, setSet] = useState(undefined) // undefined = učitava se, null = nema pristup
  const [urls, setUrls] = useState({})
  const [qr, setQr] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showLabels, setShowLabels] = useState(false)
  const fileInput = useRef(null)

  const load = async () => {
    const { data, error } = await supabase.from('tire_sets').select(SELECT).eq('id', id).maybeSingle()
    if (error) setError(errorMessage(error))
    setSet(data)
    if (data) setUrls(await signedPhotoUrls(data.photos))
  }

  useEffect(() => {
    load()
    QRCode.toDataURL(tireSetUrl(id), { margin: 1, width: 360, errorCorrectionLevel: 'M' }).then(setQr)
  }, [id])

  const save = async (fields) => {
    setError('')
    const { error } = await supabase.from('tire_sets').update(fields).eq('id', id)
    if (error) return setError(errorMessage(error))
    load()
  }

  const addPhotos = async (e) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    setError('')
    try {
      const paths = await uploadPhotos(id, files)
      await save({ photos: [...set.photos, ...paths] })
    } catch (err) {
      setError(errorMessage(err))
    }
    setUploading(false)
    e.target.value = ''
  }

  const removePhoto = async (path) => {
    if (!confirm('Obrisati ovu sliku?')) return
    await supabase.storage.from(BUCKET).remove([path])
    save({ photos: set.photos.filter((p) => p !== path) })
  }

  const setStatus = (status) =>
    save({ status, returned_at: status === 'returned' ? new Date().toISOString().slice(0, 10) : null })

  const removeSet = async () => {
    if (!confirm(`Trajno obrisati ${set.code} i sve slike?`)) return
    if (set.photos.length) await supabase.storage.from(BUCKET).remove(set.photos)
    const { error } = await supabase.from('tire_sets').delete().eq('id', id)
    if (error) return setError(errorMessage(error))
    navigate('/admin/skladiste')
  }

  if (set === undefined) return <AppLayout><div className="card empty">Učitavanje…</div></AppLayout>
  if (set === null) {
    return (
      <AppLayout>
        <div className="card empty">Ovaj set guma ne postoji ili nemate pristup.</div>
      </AppLayout>
    )
  }

  const owner = set.profiles
  const returned = set.status === 'returned'

  return (
    <AppLayout>
      {isAdmin && <Link to="/admin/skladiste" className="back-link">← Skladište</Link>}

      <section className="intro intro--row">
        <div>
          <h1 className="set-code">{set.code}</h1>
          <p className="muted">
            {SEASONS[set.season]} gume · {set.tires} kom ·{' '}
            {returned ? `vraćeno ${formatDay(set.returned_at)}` : `čuva se od ${formatDay(set.stored_at)} (${storageMonth(set.stored_at)}. mesec)`}
          </p>
        </div>
        <span className={`status ${returned ? 'status--cancelled' : 'status--done'}`}>{returned ? 'Vraćeno vlasniku' : 'U skladištu'}</span>
      </section>

      {error && <p className="error">{error}</p>}

      <div className="set-layout">
        <div className="set-main">
          <section className="card">
            <div className="card-head">
              <h2 className="card-title">Slike ({set.photos.length})</h2>
              {isAdmin && (
                <>
                  <button className="btn-primary btn-small" onClick={() => fileInput.current.click()} disabled={uploading}>
                    {uploading ? 'Šaljem…' : '📷 Dodaj slike'}
                  </button>
                  <input ref={fileInput} type="file" accept="image/*" capture="environment" multiple hidden onChange={addPhotos} />
                </>
              )}
            </div>
            {set.photos.length === 0 ? (
              <p className="muted-sm">{isAdmin ? 'Slikajte gume telefonom: sve zajedno ili svaku posebno.' : 'Još nema slika.'}</p>
            ) : (
              <div className="photo-grid">
                {set.photos.map((path) => (
                  <div key={path} className="photo">
                    <a href={urls[path]} target="_blank" rel="noreferrer">
                      <img src={urls[path]} alt={`Gume ${set.code}`} loading="lazy" />
                    </a>
                    {isAdmin && (
                      <button className="photo-remove" aria-label="Obriši sliku" onClick={() => removePhoto(path)}>×</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {isAdmin ? (
            <EditForm key={set.id + set.season + set.tires} set={set} onSave={save} />
          ) : (
            <section className="card">
              <h2 className="card-title">Podaci o gumama</h2>
              <dl className="car-details">
                <dt>Opis</dt>
                <dd>{set.description || '—'}</dd>
                {set.note && (<><dt>Napomena</dt><dd>{set.note}</dd></>)}
              </dl>
            </section>
          )}
        </div>

        <aside className="set-side">
          <section className="card">
            <h2 className="card-title">Vlasnik</h2>
            <dl className="car-details">
              <dt>Ime</dt>
              <dd>{owner?.full_name || '—'}</dd>
              <dt>Telefon</dt>
              <dd>{owner?.phone ? <a href={`tel:${owner.phone}`}>{owner.phone}</a> : '—'}</dd>
              <dt>Email</dt>
              <dd className="break">{owner?.email}</dd>
              {set.cars && (<><dt>Auto</dt><dd>{set.cars.make_model}{set.cars.plate ? ` · ${set.cars.plate}` : ''}</dd></>)}
              {isAdmin && (<><dt>Mesto</dt><dd>{set.location || '—'}</dd></>)}
            </dl>
          </section>

          {isAdmin && (
            <section className="card qr-card">
              <h2 className="card-title">QR kod</h2>
              {qr && <img src={qr} alt={`QR kod za ${set.code}`} className="qr" />}
              <button className="btn-primary" onClick={() => setShowLabels(true)}>🖨️ Štampaj nalepnice ({set.tires})</button>
              {returned ? (
                <button className="btn-secondary" onClick={() => setStatus('stored')}>Vrati u skladište</button>
              ) : (
                <button className="btn-secondary" onClick={() => setStatus('returned')}>Označi kao vraćeno vlasniku</button>
              )}
              <button className="btn-link btn-link--danger" onClick={removeSet}>Obriši set</button>
            </section>
          )}
        </aside>
      </div>

      {showLabels && (
        <div className="modal-backdrop no-print-bg" onClick={() => setShowLabels(false)}>
          <div className="card modal modal--wide" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close no-print" aria-label="Zatvori" onClick={() => setShowLabels(false)}>×</button>
            <h2 className="no-print">Nalepnice za {set.code}</h2>
            <p className="muted no-print">Po jedna nalepnica za svaku gumu. Isecite i zalepite na gume ili kesu.</p>
            <div className="labels print-area">
              {Array.from({ length: set.tires }, (_, i) => (
                <div key={i} className="label">
                  <img src={qr} alt="" />
                  <div>
                    <strong>{set.code}</strong>
                    <span>{i + 1}/{set.tires} · {SEASONS[set.season]}</span>
                    <span>{owner?.full_name}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-primary no-print" onClick={() => window.print()}>Štampaj</button>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
