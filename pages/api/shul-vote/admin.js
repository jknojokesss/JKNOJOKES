// Passcode-gated admin endpoint.
// While voting is OPEN: returns only a turnout COUNT (no names, no tally) so the
// organizers can't see who voted or which way it's going.
// Once CLOSED: returns the full tally + who voted / who didn't.
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

// Passcode lives only in the SHUL_ADMIN_CODE environment variable (a Vercel
// secret), never in source. Fails closed if the env var is missing.
const ADMIN_CODE = process.env.SHUL_ADMIN_CODE

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { passcode, action } = req.body || {}
  if (!ADMIN_CODE || passcode !== ADMIN_CODE) return res.status(401).json({ error: 'Wrong passcode.' })

  try {
    if (action === 'close') {
      await supabaseAdmin.from('shul_vote_status')
        .update({ is_open: false, closed_at: new Date().toISOString() }).eq('id', 1)
    } else if (action === 'reopen') {
      await supabaseAdmin.from('shul_vote_status')
        .update({ is_open: true, closed_at: null }).eq('id', 1)
    }

    const { data: status } = await supabaseAdmin
      .from('shul_vote_status').select('candidate_a, candidate_b, is_open, closed_at').eq('id', 1).single()

    const { data: eligible } = await supabaseAdmin
      .from('shul_vote_eligible').select('name, voted').order('name')

    const totalEligible = eligible.length
    const votedCount = eligible.filter((v) => v.voted).length

    const base = {
      isOpen: status.is_open,
      closedAt: status.closed_at,
      candidates: { A: status.candidate_a, B: status.candidate_b },
      totalEligible,
      votedCount,
    }

    // Privacy gate: names + tally only after voting is closed.
    if (status.is_open) return res.status(200).json(base)

    const { data: ballots } = await supabaseAdmin.from('shul_vote_ballots').select('choice')
    const tally = { A: 0, B: 0 }
    ballots.forEach((b) => { tally[b.choice] = (tally[b.choice] || 0) + 1 })

    return res.status(200).json({
      ...base,
      tally,
      voted: eligible.filter((v) => v.voted).map((v) => v.name),
      notVoted: eligible.filter((v) => !v.voted).map((v) => v.name),
    })
  } catch (e) {
    return res.status(500).json({ error: 'Admin request failed.' })
  }
}
