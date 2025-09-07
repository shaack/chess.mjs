// Utility helpers extracted from Chess.js, vanilla ES modules

export function rank(i) {
  return i >> 4
}

export function file(i) {
  return i & 15
}

export function algebraic(i) {
  const f = file(i)
  const r = rank(i)
  return 'abcdefgh'.substring(f, f + 1) + '87654321'.substring(r, r + 1)
}

export function swap_color(c) {
  return c === 'w' ? 'b' : 'w'
}

export function is_digit(c) {
  return '0123456789'.indexOf(c) !== -1
}

export function clone(obj) {
  const dupe = obj instanceof Array ? [] : {}
  for (const property in obj) {
    if (typeof property === 'object') {
      dupe[property] = clone(obj[property])
    } else {
      dupe[property] = obj[property]
    }
  }
  return dupe
}

export function trim(str) {
  return str.replace(/^\s+|\s+$/g, '')
}
