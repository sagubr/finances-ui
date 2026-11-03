export const setItem = (storage: Storage, key: string, value: any) => storage.setItem(key, value)

export const getItem = (Storage: Storage, key: string) => Storage.getItem(key)

const checkObject = <T extends Record<string, any>>(obj: T | undefined) =>
  obj ? (Object.keys(obj).length > 0 ? obj : {}) : ({} as T)

const checkArray = <T>(arr: T[] | undefined) => (arr ? (arr.length > 0 ? arr : []) : [])

export type Persist<T> = {
  key: string
  storage?: Storage
  omit?: (keyof T)[]
  state: T
}

export const getInitialState = <T extends Record<string, any>>({
  key: storageKey,
  omit,
  storage = localStorage,
  state,
}: Persist<T>): T => {
  const initialState: T = Object.entries(state).reduce((acc, [prop, value]) => {
    if (Array.isArray(value)) {
      ;(acc as any)[prop] = checkArray(value)
    } else if (typeof value === 'object' && value !== null) {
      ;(acc as any)[prop] = checkObject(value)
    } else {
      ;(acc as any)[prop] = value
    }
    return acc
  }, {} as T)

  if (!storageKey) return initialState

  try {
    const storedState = storage.getItem(storageKey)

    if (!storedState) return initialState

    const parsedState: unknown = JSON.parse(storedState)

    if (parsedState && typeof parsedState === 'object' && !Array.isArray(parsedState)) {
      const stateObj = parsedState as Record<string, any>

      if (omit && Array.isArray(omit)) {
        for (const propToOmit of omit) {
          delete stateObj[propToOmit as string]
        }
      }

      return {
        ...initialState,
        ...stateObj,
      }
    } else {
      console.warn('Estado persistido não é um objeto válido, utilizando estado inicial.')
      return initialState
    }
  } catch (error) {
    console.error('Erro ao recuperar o estado persistido:', error)
    return initialState
  }
}

export const persistOnStorage = <T extends Record<string, any>>({
  key: storageKey,
  omit,
  storage = localStorage,
  state,
}: Persist<T>) => {
  if (!storageKey) return null

  const stateToStore = { ...state } as Record<string, any>

  if (omit && Array.isArray(omit)) {
    for (const propToOmit of omit) {
      delete stateToStore[propToOmit as string]
    }
  }

  try {
    storage.setItem(storageKey, JSON.stringify(stateToStore))
  } catch (error) {
    console.error('Erro ao persistir o estado:', error)
  }
}
