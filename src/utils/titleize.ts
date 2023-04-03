export function titleize(text: string) {
  const words = text.toLowerCase().split(' ')
  for (let a = 0; a < words.length; a++) {
    const w = words[a]
    words[a] = w[0].toUpperCase() + w.slice(1)
  }
  return words
    .join(' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
