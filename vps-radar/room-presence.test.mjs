import test from 'node:test'
import assert from 'node:assert/strict'
import { createRoomPresence } from './room-presence.mjs'

test('anonymous presence deduplicates, expires, and never exposes IPs', () => {
  const room = createRoomPresence()
  const id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  assert.equal(room.heartbeat(id, 0), true)
  room.heartbeat(id, 15000)
  assert.deepEqual(room.snapshot(44999), [{ id, joinedAt: 0 }])
  assert.deepEqual(room.snapshot(60000), [])
  assert.equal(room.heartbeat('bad-id'), false)
  room.heartbeat(id)
  room.leave(id)
  assert.deepEqual(room.snapshot(), [])
})
