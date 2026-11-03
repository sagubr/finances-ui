const sortByField = <T, TKey extends keyof T>(
  array: T[],
  field: TKey,
  order: 'asc' | 'desc' = 'asc',
): T[] =>
  [...array].sort((a, b) => {
    let valueA = a[field] as unknown
    let valueB = b[field] as unknown

    if (typeof valueA === 'string') {
      valueA = valueA.toUpperCase()
    }

    if (typeof valueB === 'string') {
      valueB = valueB.toUpperCase()
    }

    let comparison = 0

    if ((valueA as string | number) > (valueB as string | number)) {
      comparison = 1
    } else if ((valueA as string | number) < (valueB as string | number)) {
      comparison = -1
    }

    return order === 'desc' ? comparison * -1 : comparison
  })

export default sortByField
