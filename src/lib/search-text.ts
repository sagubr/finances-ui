const DIACRITICS = /\p{Diacritic}/gu

export const normalizeSearchText = (value: unknown): string =>
  String(value ?? '')
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .toLocaleLowerCase('pt-BR')
    .trim()

export const matchesSearchText = (value: unknown, search: unknown): boolean =>
  normalizeSearchText(value).includes(normalizeSearchText(search))
