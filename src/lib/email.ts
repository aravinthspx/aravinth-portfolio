import { profile } from '../content/profile'

/**
 * Email links. `mailto:` hands off to whatever desktop mail app the visitor's OS has set
 * (often Outlook, even when they never use it), so the primary links open Gmail's compose
 * window in a new tab instead, and `mailto:` stays available as a fallback.
 */
export function gmailUrl(subject = '', body = '') {
  const q = new URLSearchParams({ view: 'cm', fs: '1', to: profile.email })
  if (subject) q.set('su', subject)
  if (body) q.set('body', body)
  // %20 rather than "+" for spaces, so they never show up as literal plus signs.
  return `https://mail.google.com/mail/?${q.toString().replace(/\+/g, '%20')}`
}

export function mailtoUrl(subject = '', body = '') {
  const q = [subject && `subject=${encodeURIComponent(subject)}`, body && `body=${encodeURIComponent(body)}`].filter(Boolean).join('&')
  return `mailto:${profile.email}${q ? `?${q}` : ''}`
}
