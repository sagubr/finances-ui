import { mix } from 'polished'
import tinycolor from 'tinycolor2'

export const getContrast = (hex: string) => {
  const lightVariant = mix(0.1, hex, '#fff')

  const darkVariant = mix(0.3, hex, '#000')

  const contrastColor = tinycolor
    .mostReadable(hex, [lightVariant, darkVariant], {
      includeFallbackColors: true,
      level: 'AA',
      size: 'small',
    })
    .toHexString()

  return contrastColor
}
