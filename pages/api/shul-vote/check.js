// Step 1: voter types their phone. We confirm only (a) is it eligible and
// (b) has it already voted. We do NOT return the name or any other voter data,
// to avoid turning this into a phone-number lookup tool.
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { normalizePhone } from '../../../lib/shulVote'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const phone = normalizePhone(req.body?.phone)
  if (!phone) return res.status(400).json({ error: 'Please enter a valid 10-digit phone number.' })

  try {
    const { data: status } = await supabaseAdmin
      .from('shul_vote_status').select('is_open').eq('id', 1).single()
    if (!status?.is_open) return res.status(200).json({ open: false })

    const { data: row } = await supabaseAdmin
      .from('shul_vote_eligible').select('voted').eq('phone', phone).maybeSingle()

    if (!row) return res.status(200).json({ open: true, eligible: false })
    if (row.voted) return res.status(200).json({ open: true, eligible: true, alreadyVoted: true })
    return res.status(200).json({ open: true, eligible: true, alreadyVoted: false })
  } catch (e) {
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
