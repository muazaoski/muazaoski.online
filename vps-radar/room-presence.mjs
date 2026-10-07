// Ephemeral tab presence; never written to the analytics database.
export function createRoomPresence() {
  const sessions = new Map()
  function snapshot(now = Date.now()) {
    for (const [id, session] of sessions) {
      if (now - session.lastSeen >= 45000) sessions.delete(id)
    }
    return [...sessions].map(([id, { joinedAt }]) => ({ id, joinedAt }))
  }
  return {
    snapshot,
    heartbeat(id, now = Date.now()) {
      snapshot(now)
      if (typeof id !== 'string' || !/^[a-f0-9-]{36}$/i.test(id)) return false
      if (!sessions.has(id) && sessions.size >= 200) return false
      sessions.set(id, { joinedAt: sessions.get(id)?.joinedAt ?? now, lastSeen: now })
      return true
    },
    leave(id) { sessions.delete(id) }
  }
}
