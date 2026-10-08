import fs from 'node:fs'
import crypto from 'node:crypto'
import { AVATAR_OPTIONS } from './avatar-options.mjs'

export function createGuestbook(file) {
  // Separate from visit/cheer totals. Never silently overwrite a broken guestbook.
  let entries = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : []
  if (!Array.isArray(entries)) throw new Error('Invalid guestbook database')
  const cooldowns = new Map()
  return {
    list: () => entries,
    post(payload, visitorKey, countryCode, now = Date.now()) {
      const fail = (status, error) => ({ status, error })
      if (!payload || typeof payload !== 'object' || payload.website) return fail(400, 'Please check your submission.')
      const name = typeof payload.name === 'string' ? payload.name.trim() : ''
      const message = typeof payload.message === 'string' ? payload.message.trim() : ''
      if (!name || name.length > 32 || !message || message.length > 400 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(name + message)) return fail(400, 'Use a name (1–32 characters) and a message (1–400 characters).')
      const avatar = {}
      for (const [key, values] of Object.entries(AVATAR_OPTIONS)) {
        if (!values.includes(payload.avatar?.[key])) return fail(400, 'Choose valid avatar options.')
        avatar[key] = payload.avatar[key]
      }
      for (const [key, time] of cooldowns) if (now - time >= 60000) cooldowns.delete(key)
      if (cooldowns.has(visitorKey)) return fail(429, 'Give it a minute before hanging another portrait.')
      if (entries.length >= 500 || cooldowns.size >= 10000) return fail(503, 'The wall is full right now. Please try later.')
      const code = /^[A-Z]{2}$/.test(countryCode || '') && countryCode !== 'XX' ? countryCode : 'ZZ'
      const country = code === 'ZZ' ? 'Unknown location' : new Intl.DisplayNames(['en'], { type: 'region' }).of(code)
      const entry = { id: crypto.randomUUID(), name, message, avatar, code, country, createdAt: now }
      const next = [entry, ...entries]
      try {
        fs.writeFileSync(`${file}.tmp`, JSON.stringify(next), 'utf8')
        fs.renameSync(`${file}.tmp`, file)
      } catch (_) { return fail(503, 'Could not save your portrait. Please try again.') }
      entries = next
      cooldowns.set(visitorKey, now)
      return { status: 201, entry }
    }
  }
}
