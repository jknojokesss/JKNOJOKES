// Public, safe-to-expose config for the voter page: candidate names + whether
// voting is open. Reveals NOTHING about who is eligible or who has voted.
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from('shul_vote_status')
      .select('candidate_a, candidate_b, is_open')
      .eq('id', 1)
      .single()
    if (error) throw error
    return res.status(200).json({
      open: data.is_open,
      candidates: { A: data.candidate_a, B: data.candidate_b },
    })
  } catch (e) {
    return res.status(500).json({ error: 'Could not load election config.' })
  }
}
