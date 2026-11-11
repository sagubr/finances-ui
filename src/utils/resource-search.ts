const normalizeSearchText = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')

export const filterResources = <T>(items: readonly T[], search: string): T[] => {
  const normalizedSearch = normalizeSearchText(search.trim())
  if (!normalizedSearch) return Array.from(items)

  return items.filter((item) =>
    normalizeSearchText(JSON.stringify(item)).includes(normalizedSearch),
  )
}
