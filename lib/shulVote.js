// Shared helpers for the shul board-election vote.

// Normalize any user-entered US phone to an 11-digit string like 19178167670.
// Accepts "(917) 816-7670", "917-816-7670", "9178167670", "+1 917 816 7670".
// Returns null if it isn't a plausible 10-digit US number.
export function normalizePhone(input) {
  const digits = String(input || '').replace(/\D/g, '')
  if (digits.length === 10) return '1' + digits
  if (digits.length === 11 && digits[0] === '1') return digits
  return null
}
