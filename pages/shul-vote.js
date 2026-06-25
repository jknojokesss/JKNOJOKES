import { useState, useEffect } from 'react'
import Head from 'next/head'

const NAVY = '#1A2035'
const GOLD = '#C9A84C'
const INK = '#1A1A2E'
const MUTED = '#7A8090'
const CREAM = '#F7F4EF'

function fmtPhone(digits) {
  digits = digits.slice(0, 10)
  const a = digits.slice(0, 3), b = digits.slice(3, 6), c = digits.slice(6, 10)
  let out = ''
  if (a) { out = '(' + a; if (a.length === 3) out += ')' }
  if (b) out += ' ' + b
  if (c) out += '-' + c
  return out
}

export default function ShulVote() {
  const [step, setStep] = useState('loading')   // loading | phone | pick | done | closed
  const [candidates, setCandidates] = useState({ A: 'Candidate A', B: 'Candidate B' })
  const [phone, setPhone] = useState('')
  const [choice, setChoice] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch('/api/shul-vote/config').then((r) => r.json()).then((d) => {
      if (d.candidates) setCandidates(d.candidates)
      setStep(d.open ? 'phone' : 'closed')
    }).catch(() => setStep('phone'))
  }, [])

  const digits = phone.replace(/\D/g, '')
  const phoneReady = digits.length === 10

  async function checkPhone() {
    setError(''); setBusy(true)
    try {
      const r = await fetch('/api/shul-vote/check', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const d = await r.json()
      if (!r.ok) { setError(d.error || 'Something went wrong.'); return }
      if (!d.open) { setStep('closed'); return }
      if (!d.eligible) { setError('This number is not on the voter list. Double-check it, or contact the organizer.'); return }
      if (d.alreadyVoted) { setError('This number has already voted. Each person can vote once.'); return }
      setStep('pick')
    } catch { setError('Network error. Please try again.') }
    finally { setBusy(false) }
  }

  async function submitVote() {
    if (!choice) { setError('Please tap a candidate first.'); return }
    setError(''); setBusy(true)
    try {
      const r = await fetch('/api/shul-vote/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, choice }),
      })
      const d = await r.json()
      if (!r.ok) { setError(d.error || 'Could not record your vote.'); return }
      setStep('done')
    } catch { setError('Network error. Please try again.') }
    finally { setBusy(false) }
  }

  return (
    <>
      <Head><title>Gabbai Vote</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 16px', fontFamily: 'Georgia, serif' }}>
        <div style={{ width: '100%', maxWidth: 380, background: '#fff', borderRadius: 16, padding: '32px 26px', marginTop: '6vh' }}>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 26, color: INK, letterSpacing: 0.5 }}>Gabbai Vote</div>
            <div style={{ width: 40, height: 3, background: GOLD, margin: '12px auto 0', borderRadius: 2 }} />
          </div>

          {step === 'loading' && <p style={{ textAlign: 'center', color: MUTED }}>Loading…</p>}

          {step === 'closed' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 17, color: INK, marginBottom: 8 }}>Voting is closed</div>
              <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.6 }}>Thank you. The election is no longer accepting votes.</div>
            </div>
          )}

          {step === 'phone' && (
            <div>
              <label style={{ fontSize: 13, color: MUTED, display: 'block', marginBottom: 7 }}>Enter your phone number to begin</label>
              <input
                type="tel" inputMode="numeric" placeholder="(___) ___-____" autoComplete="off"
                value={phone}
                onChange={(e) => setPhone(fmtPhone(e.target.value.replace(/\D/g, '')))}
                onKeyDown={(e) => { if (e.key === 'Enter' && phoneReady && !busy) checkPhone() }}
                style={{ width: '100%', boxSizing: 'border-box', fontSize: 19, padding: '13px 14px', border: '1.5px solid #DDD8CF', borderRadius: 10, fontFamily: 'Georgia, serif', letterSpacing: 0.5, outline: 'none' }}
              />
              <div style={{ fontSize: 12, color: MUTED, margin: '8px 2px 0' }}>Used only to confirm you're eligible. Your vote stays anonymous.</div>
              {error && <div style={{ fontSize: 13, color: '#B23A2E', marginTop: 12, lineHeight: 1.5 }}>{error}</div>}
              <button onClick={checkPhone} disabled={!phoneReady || busy}
                style={{ width: '100%', marginTop: 18, padding: 14, border: 'none', borderRadius: 11, background: phoneReady ? NAVY : '#C9CCD4', color: phoneReady ? '#fff' : '#fff', fontSize: 15, fontFamily: 'Georgia, serif', cursor: phoneReady && !busy ? 'pointer' : 'default', letterSpacing: 0.5 }}>
                {busy ? 'Checking…' : 'Continue'}
              </button>
            </div>
          )}

          {step === 'pick' && (
            <div>
              <div style={{ fontSize: 15, color: INK, marginBottom: 4 }}>Choose one candidate</div>
              <div style={{ fontSize: 13, color: MUTED, marginBottom: 18 }}>Tap your choice, then submit.</div>
              {[['A', candidates.A], ['B', candidates.B]].map(([key, name]) => (
                <div key={key} onClick={() => { setChoice(key); setError('') }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 16px', marginBottom: 12, borderRadius: 11, cursor: 'pointer', border: choice === key ? `2px solid ${GOLD}` : '1.5px solid #DDD8CF', background: choice === key ? CREAM : '#fff' }}>
                  <span style={{ fontSize: 17, color: INK }}>{name}</span>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', border: choice === key ? `7px solid ${GOLD}` : '2px solid #C9CCD4', boxSizing: 'border-box' }} />
                </div>
              ))}
              {error && <div style={{ fontSize: 13, color: '#B23A2E', marginTop: 8 }}>{error}</div>}
              <button onClick={submitVote} disabled={busy}
                style={{ width: '100%', marginTop: 14, padding: 14, border: 'none', borderRadius: 11, background: NAVY, color: '#fff', fontSize: 15, fontFamily: 'Georgia, serif', cursor: busy ? 'default' : 'pointer', letterSpacing: 0.5 }}>
                {busy ? 'Submitting…' : 'Submit vote'}
              </button>
            </div>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: 54, height: 54, borderRadius: '50%', background: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28, color: GOLD }}>✓</div>
              <div style={{ fontSize: 20, color: INK, marginBottom: 8 }}>Thank you</div>
              <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.6 }}>Your vote has been recorded. You can close this page.</div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
