import CSV from '@/assets/icons/csv.png'
import DOC from '@/assets/icons/doc.png'
import DOCX from '@/assets/icons/docx.png'
import JFIF from '@/assets/icons/jfif.png'
import JPEG from '@/assets/icons/jpeg.png'
import JPG from '@/assets/icons/jpg.png'
import MP4 from '@/assets/icons/mp4.png'
import ODP from '@/assets/icons/odp.png'
import ODT from '@/assets/icons/odt.png'
import PDF from '@/assets/icons/pdf.png'
import PNG from '@/assets/icons/png.png'
import PPT from '@/assets/icons/ppt.png'
import PPTX from '@/assets/icons/pptx.png'
import SVG from '@/assets/icons/svg.png'
import TXT from '@/assets/icons/txt.png'
import XLS from '@/assets/icons/xls.png'
import XLSM from '@/assets/icons/xlsm.png'
import XLSX from '@/assets/icons/xlsx.png'

type AllExtensions =
  | 'csv'
  | 'doc'
  | 'docx'
  | 'jfif'
  | 'jpeg'
  | 'jpg'
  | 'mp4'
  | 'odp'
  | 'odt'
  | 'pdf'
  | 'png'
  | 'ppt'
  | 'pptx'
  | 'svg'
  | 'txt'
  | 'xls'
  | 'xlsx'
  | 'xlsm'
  | string

type Units = 'B' | 'KB' | 'MB' | 'GB'

export const units = {
  B: 1,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
}

export const fileImages = {
  csv: CSV,
  doc: DOC,
  docx: DOCX,
  jfif: JFIF,
  jpeg: JPEG,
  jpg: JPG,
  mp4: MP4,
  odp: ODP,
  odt: ODT,
  pdf: PDF,
  png: PNG,
  ppt: PPT,
  pptx: PPTX,
  svg: SVG,
  txt: TXT,
  xls: XLS,
  xlsx: XLSX,
  xlsm: XLSM,
}

export const fileClassNames: Record<string, string> = {
  csv: 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100',
  doc: 'text-blue-500 bg-blue-50 hover:bg-blue-100',
  docx: 'text-blue-500 bg-blue-50 hover:bg-blue-100',
  jfif: 'text-teal-500 bg-teal-50 hover:bg-teal-100',
  jpeg: 'text-teal-500 bg-teal-50 hover:bg-teal-100',
  jpg: 'text-teal-500 bg-teal-50 hover:bg-teal-100',
  mp4: 'text-teal-500 bg-teal-50 hover:bg-teal-100',
  odp: 'text-slate-500 bg-slate-50 hover:bg-slate-100',
  odt: 'text-slate-500 bg-slate-50 hover:bg-slate-100',
  pdf: 'text-red-500 bg-red-50 hover:bg-red-100',
  png: 'text-teal-500 bg-teal-50 hover:bg-teal-100',
  ppt: 'text-orange-500 bg-orange-50 hover:bg-orange-100',
  pptx: 'text-orange-500 bg-orange-50 hover:bg-orange-100',
  svg: 'text-amber-500 bg-amber-50 hover:bg-amber-100',
  txt: 'text-neutral-500 bg-neutral-50 hover:bg-neutral-100',
  xls: 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100',
  xlsx: 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100',
  xlsm: 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100',
}

export const getFileExtension = (string: string): AllExtensions | undefined => {
  const regex = /(?<=\.)[^.\\/:*?"<>|\r\n]+$/
  const match = string.match(regex)

  if (match) {
    const extension = match[0]
    return extension
  }
}

export const getFileSize = (fileSize: number, unit: Units = 'B') => {
  if (isNaN(fileSize) || !units[unit]) {
    throw new Error('Invalid size or unit')
  }

  if (unit === 'B') {
    if (fileSize >= units['MB']) {
      return (fileSize / units['MB']).toFixed(2) + ' MB'
    }
    return (fileSize / units['KB']).toFixed(2) + ' KB'
  }

  return (fileSize / units[unit]).toFixed(2) + ' ' + unit
}
