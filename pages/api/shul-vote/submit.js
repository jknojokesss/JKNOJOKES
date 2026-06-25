// Step 2: record the vote. Two writes that share NO key:
//   1) flip the voter's `voted` flag (turnout / double-vote guard)
//   2) insert an anonymous ballot ('A' or 'B') with no timestamp, no voter id
// The flip is a conditional update (voted = false) so a double-submit can never
// produce two ballots, even on a race.
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { normalizePhone } from '../../../lib/shulVote'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const phone = normalizePhone(req.body?.phone)
  const choice = req.body?.choice
  if (!phone) return res.status(400).json({ error: 'Invalid phone number.' })
  if (choice !== 'A' && choice !== 'B') return res.status(400).json({ error: 'Please choose a candidate.' })

  try {
    const { data: status } = await supabaseAdmin
      .from('shul_vote_status').select('is_open').eq('id', 1).single()
    if (!status?.is_open) return res.status(409).json({ error: 'Voting is closed.' })

    // Atomically claim this voter: only succeeds if they exist AND haven't voted.
    const { data: claimed, error: claimErr } = await supabaseAdmin
      .from('shul_vote_eligible')
      .update({ voted: true })
      .eq('phone', phone)
      .eq('voted', false)
      .select('id')
    if (claimErr) throw claimErr

    if (!claimed || claimed.length === 0) {
      // Either not eligible, or already voted. Distinguish for a clear message.
      const { data: exists } = await supabaseAdmin
        .from('shul_vote_eligible').select('voted').eq('phone', phone).maybeSingle()
      if (!exists) return res.status(403).json({ error: 'This number is not on the voter list.' })
      return res.status(409).json({ error: 'This number has already voted.' })
    }

    // Record the anonymous ballot. If this fails, release the claim so they can retry.
    const { error: ballotErr } = await supabaseAdmin
      .from('shul_vote_ballots').insert({ choice })
    if (ballotErr) {
      await supabaseAdmin.from('shul_vote_eligible').update({ voted: false }).eq('phone', phone)
      throw ballotErr
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: 'Could not record your vote. Please try again.' })
  }
}
