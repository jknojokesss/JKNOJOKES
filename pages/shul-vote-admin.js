import { useState } from 'react'
import Head from 'next/head'

const NAVY = '#1A2035'
const GOLD = '#C9A84C'
const INK = '#1A1A2E'
const MUTED = '#7A8090'
const CREAM = '#F7F4EF'

export default function ShulVoteAdmin() {
  const [passcode, setPasscode] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function call(action) {
    setError(''); setBusy(true)
    try {
      const r = await fetch('/api/shul-vote/admin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, action }),
      })
      const d = await r.json()
      if (!r.ok) { setError(d.error || 'Request failed.'); setData(null); return }
      setData(d)
    } catch { setError('Network error.') }
    finally { setBusy(false) }
  }

  const pct = data && data.totalEligible ? Math.round((data.votedCount / data.totalEligible) * 100) : 0

  return (
    <>
      <Head><title>Election Admin</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div style={{ minHeight: '100vh', background: CREAM, padding: '32px 16px', fontFamily: 'Georgia, serif' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', background: '#fff', borderRadius: 16, padding: '28px 26px', border: '1px solid #ECE7DD' }}>
          <div style={{ fontSize: 22, color: INK, marginBottom: 4 }}>Gabbai Vote — Admin</div>
          <div style={{ width: 40, height: 3, background: GOLD, borderRadius: 2, marginBottom: 22 }} />

          {!data && (
            <div>
              <label style={{ fontSize: 13, color: MUTED, display: 'block', marginBottom: 7 }}>Admin passcode</label>
              <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') call('status') }}
                style={{ width: '100%', boxSizing: 'border-box', fontSize: 16, padding: '12px 14px', border: '1.5px solid #DDD8CF', borderRadius: 10, fontFamily: 'Georgia, serif', outline: 'none' }} />
              {error && <div style={{ fontSize: 13, color: '#B23A2E', marginTop: 12 }}>{error}</div>}
              <button onClick={() => call('status')} disabled={busy}
                style={{ width: '100%', marginTop: 16, padding: 13, border: 'none', borderRadius: 11, background: NAVY, color: '#fff', fontSize: 15, fontFamily: 'Georgia, serif', cursor: 'pointer' }}>
                {busy ? 'Loading…' : 'View turnout'}
              </button>
            </div>
          )}

          {data && (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 38, color: NAVY }}>{data.votedCount}</span>
                <span style={{ fontSize: 16, color: MUTED }}>of {data.totalEligible} voted</span>
                <span style={{ fontSize: 16, color: GOLD, marginLeft: 'auto' }}>{pct}%</span>
              </div>
              <div style={{ height: 8, background: '#ECE7DD', borderRadius: 4, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ width: pct + '%', height: '100%', background: GOLD }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: data.isOpen ? '#E6F2E6' : '#F1E3E0', color: data.isOpen ? '#2E7D32' : '#B23A2E' }}>
                  {data.isOpen ? '● Voting open' : '● Voting closed'}
                </span>
                <span style={{ fontSize: 13, color: MUTED }}>{data.candidates.A} vs {data.candidates.B}</span>
              </div>

              {data.isOpen && (
                <div style={{ background: CREAM, borderRadius: 10, padding: '14px 16px', fontSize: 13, color: MUTED, lineHeight: 1.6, marginBottom: 18 }}>
                  Names and the tally are hidden while voting is open — you can only see the count.
                  Close voting to reveal who voted and the result.
                </div>
              )}

              {!data.isOpen && data.tally && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 14, color: INK, marginBottom: 10 }}>Result</div>
                  {[['A', data.candidates.A], ['B', data.candidates.B]].map(([k, name]) => {
                    const v = data.tally[k] || 0
                    const total = (data.tally.A || 0) + (data.tally.B || 0)
                    const w = total ? Math.round((v / total) * 100) : 0
                    const win = total && v === Math.max(data.tally.A || 0, data.tally.B || 0)
                    return (
                      <div key={k} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: INK, marginBottom: 4 }}>
                          <span>{name}{win && total ? ' ✓' : ''}</span><span>{v} ({w}%)</span>
                        </div>
                        <div style={{ height: 10, background: '#ECE7DD', borderRadius: 5, overflow: 'hidden' }}>
                          <div style={{ width: w + '%', height: '100%', background: win ? GOLD : '#C9CCD4' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {!data.isOpen && data.voted && (
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 13, color: INK, marginBottom: 6 }}>Voted ({data.voted.length})</div>
                    <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.7 }}>{data.voted.join(', ') || '—'}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 13, color: INK, marginBottom: 6 }}>Didn't vote ({data.notVoted.length})</div>
                    <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.7 }}>{data.notVoted.join(', ') || '—'}</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button onClick={() => call('status')} disabled={busy}
                  style={{ flex: 1, padding: 12, border: '1.5px solid #DDD8CF', borderRadius: 10, background: '#fff', color: INK, fontSize: 14, fontFamily: 'Georgia, serif', cursor: 'pointer' }}>
                  Refresh
                </button>
                {data.isOpen ? (
                  <button onClick={() => { if (confirm('Close voting? This reveals names + the result and stops new votes.')) call('close') }} disabled={busy}
                    style={{ flex: 1, padding: 12, border: 'none', borderRadius: 10, background: '#B23A2E', color: '#fff', fontSize: 14, fontFamily: 'Georgia, serif', cursor: 'pointer' }}>
                    Close voting
                  </button>
                ) : (
                  <button onClick={() => { if (confirm('Re-open voting?')) call('reopen') }} disabled={busy}
                    style={{ flex: 1, padding: 12, border: '1.5px solid #DDD8CF', borderRadius: 10, background: '#fff', color: INK, fontSize: 14, fontFamily: 'Georgia, serif', cursor: 'pointer' }}>
                    Re-open voting
                  </button>
                )}
              </div>
              {error && <div style={{ fontSize: 13, color: '#B23A2E', marginTop: 12 }}>{error}</div>}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
