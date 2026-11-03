export const stringToPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '')

  let formatted = ''
  if (digits.length > 0) {
    formatted = '(' + digits.slice(0, 2)
  }
  if (digits.length >= 3) {
    formatted += ') ' + digits.slice(2, 3)
  }
  if (digits.length >= 4) {
    formatted += ' ' + digits.slice(3, 7)
  }
  if (digits.length >= 8) {
    formatted += '-' + digits.slice(7, 11)
  }

  return formatted
}

export const phoneToRaw = (phone: string) => {
  return phone.replace(/[()\s-]/g, '')
}

export const isPhoneValid = (raw: string): boolean => {
  const digits = raw.replace(/\D/g, '')
  return /^\d{10,11}$/.test(digits)
}

export const getFirstLetter = (string: string) => {
  return string.slice(0, 1)
}

export const generateRandomPassword = (): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const symbols = '!@#$%&*+-=[]<>?'
  const allChars = uppercase + lowercase + symbols

  let password = ''

  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  for (let i = password.length; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
    .substring(0, 12)
}

export const getInitials = (name: string) => {
  if (!name) return null
  const nameArray = name.split(' ')

  const [firstName, lastName] = [nameArray[0], nameArray[nameArray.length - 1]]

  return nameArray.length > 1 ? `${firstName[0]}${lastName[0]}` : firstName[0]
}

export const getUserFromEmail = (email: string) => {
  return email.split('@')[0]
}
