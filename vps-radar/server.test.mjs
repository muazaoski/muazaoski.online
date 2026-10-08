import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, copyFile, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { once } from 'node:events'

test('real cheers group by country, persist, and preserve legacy totals', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'radar-cheer-test-'))
  await copyFile(new URL('./server.mjs', import.meta.url), path.join(dir, 'server.mjs'))
  await copyFile(new URL('./room-presence.mjs', import.meta.url), path.join(dir, 'room-presence.mjs'))
  for (const file of ['guestbook.mjs', 'avatar-options.mjs']) await copyFile(new URL(`./${file}`, import.meta.url), path.join(dir, file))
  await mkdir(path.join(dir, 'data'))
  const database = path.join(dir, 'data', 'radar-stats.json')
  await writeFile(database, JSON.stringify({ cheers: 1861, countries: {}, totalVisits: 0 }))
  let child
  async function start() {
    child = spawn(process.execPath, [path.join(dir, 'server.mjs')], { env: { ...process.env, PORT: '0' }, windowsHide: true })
    return new Promise((resolve, reject) => {
      let output = ''
      child.stdout.on('data', chunk => {
        output += chunk
        const port = output.match(/http:\/\/0\.0\.0\.0:(\d+)/)?.[1]
        if (port) resolve(`http://127.0.0.1:${port}/api/radar`)
      })
      child.once('error', reject)
      child.once('exit', code => reject(new Error(`Server exited: ${code}`)))
    })
  }
  async function stop() {
    const exited = once(child, 'exit')
    child.kill()
    await exited
  }
  try {
    let base = await start()
    const avatar = (await import('./avatar-options.mjs')).DEFAULT_AVATAR
    const portrait = await fetch(`${base}/guestbook`, { method: 'POST', body: JSON.stringify({ name: 'Museum visitor', message: 'Hello from the wall!', avatar, code: 'SG' }) })
    assert.equal(portrait.status, 201)
    const savedPortrait = (await portrait.json()).entry
    assert.equal(savedPortrait.country, 'Singapore')
    assert.equal((await fetch(`${base}/guestbook`, { method: 'POST', body: JSON.stringify({ name: 'Museum visitor', message: 'Too soon', avatar }) })).status, 429)
    assert.deepEqual((await (await fetch(`${base}/guestbook`)).json()).entries, [savedPortrait])
    const roomIds = ['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb']
    for (const id of roomIds) {
      assert.equal((await (await fetch(`${base}/room`, {
        method: 'POST', body: JSON.stringify({ id })
      })).json()).success, true)
    }
    const room = await (await fetch(`${base}/room`)).json()
    assert.deepEqual(room.visitors.map(visitor => visitor.id), roomIds)
    await fetch(`${base}/room/leave`, { method: 'POST', body: JSON.stringify({ id: roomIds[0] }) })
    assert.equal((await (await fetch(`${base}/room`)).json()).visitors.length, 1)
    const post = async code => (await fetch(`${base}/cheer`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code })
    })).json()
    for (let index = 0; index < 59; index++) await post('SG')
    await post('US')
    const result = await post('NG')
    assert.equal(result.cheers, 1922)
    assert.deepEqual(result.cheerEvents.map(({ country, count }) => ({ country, count })), [
      { country: 'Nigeria', count: 1 }, { country: 'USA', count: 1 }, { country: 'Singapore', count: 59 }
    ])
    assert.ok(result.cheerEvents.every(event => Number.isFinite(event.updatedAt)))
    assert.equal(JSON.stringify(result.cheerEvents).includes('ip'), false)
    await stop()
    // An expired group must not swallow a new session.
    const saved = JSON.parse(await readFile(database, 'utf8'))
    saved.cheerEvents[2].updatedAt = Date.now() - 6 * 60 * 1000
    saved.cheerEvents.push(...Array.from({ length: 35 }, (_, index) => ({ code: 'CA', country: 'Canada', count: 1, updatedAt: index })))
    await writeFile(database, JSON.stringify(saved))
    base = await start()
    assert.deepEqual((await (await fetch(`${base}/guestbook`)).json()).entries, [savedPortrait])
    const next = await post('SG')
    assert.equal(next.cheerEvents[0].count, 1)
    assert.equal(next.cheerEvents.length, 30)
    const activity = await (await fetch(`${base}/cheers`)).json()
    assert.deepEqual(activity.cheerEvents, next.cheerEvents)
    assert.equal(activity.cheers, 1923)
    const legacy = await (await fetch(`${base}/cheer`, { method: 'POST' })).json()
    assert.equal(legacy.cheers, 1924)
    assert.equal(legacy.cheerEvents[0].country, 'Unknown location')
  } finally {
    if (child && child.exitCode === null && child.signalCode === null) await stop()
    // Only the isolated mkdtemp test fixture is removed; never the real radar database.
    await rm(dir, { recursive: true, force: true })
  }
})
