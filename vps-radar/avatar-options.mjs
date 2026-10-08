export const AVATAR_OPTIONS = {
  skin: ['#f5d7b1', '#dba77c', '#b97850', '#825238', '#51382d', '#6cabdd'],
  eyes: ['dots', 'happy', 'sleepy', 'wink'],
  mouth: ['smile', 'grin', 'neutral', 'surprised'],
  hair: ['short', 'bob', 'curly', 'none'],
  hat: ['none', 'cap', 'beanie', 'crown'],
  misc: ['none', 'glasses', 'blush', 'earrings'],
  frame: ['oak', 'gold', 'blue', 'pink']
}
export const DEFAULT_AVATAR = Object.fromEntries(Object.entries(AVATAR_OPTIONS).map(([key, values]) => [key, values[0]]))
