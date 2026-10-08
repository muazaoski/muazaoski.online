import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createGuestbook } from './guestbook.mjs'
import { DEFAULT_AVATAR } from './avatar-options.mjs'

test('guestbook validates, limits spam, persists and keeps public data minimal', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'radar-guestbook-'))
  const file = path.join(dir, 'guestbook.json')
  try {
    const book = createGuestbook(file)
    const payload = { name: 'Visitor', message: '<script>not executed</script>', avatar: DEFAULT_AVATAR }
    assert.equal(book.post({ ...payload, name: '' }, 'one', 'MY', 0).status, 400)
    assert.equal(book.post({ ...payload, message: 'x'.repeat(401) }, 'one', 'MY', 0).status, 400)
    assert.equal(book.post({ ...payload, avatar: { ...DEFAULT_AVATAR, eyes: 'evil' } }, 'one', 'MY', 0).status, 400)
    assert.equal(book.post({ ...payload, website: 'spam' }, 'one', 'MY', 0).status, 400)
    const result = book.post(payload, 'one', 'MY', 0)
    assert.equal(result.status, 201)
    assert.equal(result.entry.country, 'Malaysia')
    assert.equal(result.entry.message, payload.message)
    assert.equal(book.post(payload, 'one', 'MY', 1000).status, 429)
    assert.equal(book.post(payload, 'two', undefined, 1000).entry.country, 'Unknown location')
    assert.equal(book.post(payload, 'one', 'SG', 60000).status, 201)
    assert.deepEqual(createGuestbook(file).list(), book.list())
    assert.equal(readFileSync(file, 'utf8').includes('visitorKey'), false)
    writeFileSync(file, '{}')
    assert.throws(() => createGuestbook(file), /Invalid guestbook/)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})
