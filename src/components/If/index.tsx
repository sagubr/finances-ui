import type { ReactNode } from 'react'

type IfProps = {
  condition: boolean
  onTrue: ReactNode
  onFalse?: ReactNode
}

const If = ({ condition, onTrue, onFalse = null }: IfProps) => {
  return condition ? onTrue : onFalse
}

export default If
