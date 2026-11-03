import { Store, useStore } from '@tanstack/react-store'

const STORAGE_KEY = 'financial-competence-month'
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

const currentMonth = () =>
  new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit' })
    .format(new Date())
    .slice(0, 7)

const initialMonth = () => {
  if (typeof window === 'undefined') return currentMonth()
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored && MONTH_PATTERN.test(stored) ? stored : currentMonth()
}

export const competenceStore = new Store({ month: initialMonth() })

export const setCompetenceMonth = (month: string) => {
  if (!MONTH_PATTERN.test(month)) return
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, month)
  competenceStore.setState(() => ({ month }))
}

export const useCompetenceMonth = () => useStore(competenceStore, (state) => state.month)
