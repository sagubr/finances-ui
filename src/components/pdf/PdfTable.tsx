import { StyleSheet, Text, View } from '@react-pdf/renderer'
import React, { useMemo } from 'react'

export interface PdfTableTheme {
  borderColor: string
  headerBg: string
  rowEvenBg: string
  rowOddBg: string
  headerTextColor: string
  cellTextColor: string
  emptyTextColor: string
  fontSize: number
  cellPadding: number
  minRowHeight: number
}

const defaultTheme: PdfTableTheme = {
  borderColor: '#e5e7eb',
  headerBg: '#f3f4f6',
  rowEvenBg: '#ffffff',
  rowOddBg: '#fafafa',
  headerTextColor: '#111827',
  cellTextColor: '#374151',
  emptyTextColor: '#9ca3af',
  fontSize: 8,
  cellPadding: 4,
  minRowHeight: 24,
}

function buildStyles(theme: PdfTableTheme) {
  return StyleSheet.create({
    tableContainer: {
      flexDirection: 'column',
      marginTop: 12,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderColor: theme.borderColor,
    },
    row: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
      alignItems: 'stretch',
      minHeight: theme.minRowHeight,
    },
    headerRow: {
      backgroundColor: theme.headerBg,
    },
    rowEven: {
      backgroundColor: theme.rowEvenBg,
    },
    rowOdd: {
      backgroundColor: theme.rowOddBg,
    },
    col: {
      borderRightWidth: 1,
      borderRightColor: theme.borderColor,
      padding: theme.cellPadding,
      justifyContent: 'center',
    },
    headerCell: {
      fontSize: theme.fontSize,
      fontWeight: 700,
      color: theme.headerTextColor,
    },
    cell: {
      fontSize: theme.fontSize,
      color: theme.cellTextColor,
    },
    emptyRow: {
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontSize: theme.fontSize,
      color: theme.emptyTextColor,
    },
  })
}

const styleSheetCache = new WeakMap<PdfTableTheme, ReturnType<typeof buildStyles>>()

function getStyles(theme: PdfTableTheme) {
  let cached = styleSheetCache.get(theme)
  if (!cached) {
    cached = buildStyles(theme)
    styleSheetCache.set(theme, cached)
  }
  return cached
}

export interface PdfColumn<T> {
  header: string
  accessorKey: keyof T | ((row: T) => any)
  width?: number | string
  align?: 'left' | 'center' | 'right'
  cell?: (value: any, row: T) => React.ReactNode
}

export interface PdfTableProps<T> {
  data: T[]
  columns: PdfColumn<T>[]
  keyExtractor?: (row: T, index: number) => string | number
  striped?: boolean
  emptyMessage?: string
  repeatHeader?: boolean
  theme?: Partial<PdfTableTheme>
}

function resolveValue<T>(col: PdfColumn<T>, row: T) {
  return typeof col.accessorKey === 'function' ? col.accessorKey(row) : row[col.accessorKey]
}

function formatValue(value: any): string {
  if (value == null) return '-'
  if (value instanceof Date) return value.toLocaleDateString('pt-BR')
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
  if (typeof value === 'number') return value.toLocaleString('pt-BR')
  return String(value)
}

function alignToItems(align?: 'left' | 'center' | 'right') {
  switch (align) {
    case 'center':
      return 'center'
    case 'right':
      return 'flex-end'
    default:
      return 'flex-start'
  }
}

interface ColumnLayout {
  width: number | string
  borderRightWidth: 0 | 1
  alignItems: 'flex-start' | 'center' | 'flex-end'
  textAlign: 'left' | 'center' | 'right'
}

interface RowProps<T> {
  row: T
  columns: PdfColumn<T>[]
  layouts: ColumnLayout[]
  rowStyle: any
  styles: ReturnType<typeof buildStyles>
}

const PdfTableRowInner = <T,>({ row, columns, layouts, rowStyle, styles }: RowProps<T>) => (
  <View style={[styles.row, rowStyle]} wrap={false}>
    {columns.map((col, colIndex) => {
      const value = resolveValue(col, row)
      return (
        <View key={colIndex} style={[styles.col, layouts[colIndex]]}>
          <Text style={[styles.cell, { textAlign: layouts[colIndex].textAlign }]}>
            {col.cell ? col.cell(value, row) : formatValue(value)}
          </Text>
        </View>
      )
    })}
  </View>
)
const PdfTableRow = React.memo(PdfTableRowInner) as typeof PdfTableRowInner

function PdfTableInner<T>({
  data,
  columns,
  keyExtractor,
  striped = true,
  emptyMessage = 'Nenhum registro encontrado',
  repeatHeader = false,
  theme,
}: PdfTableProps<T>) {
  const mergedTheme = useMemo<PdfTableTheme>(
    () => (theme ? { ...defaultTheme, ...theme } : defaultTheme),
    [theme],
  )
  const styles = useMemo(() => getStyles(mergedTheme), [mergedTheme])
  const columnLayouts = useMemo<ColumnLayout[]>(
    () =>
      columns.map((col, i) => ({
        width: col.width ?? `${100 / columns.length}%`,
        borderRightWidth: i === columns.length - 1 ? 0 : 1,
        alignItems: alignToItems(col.align),
        textAlign: col.align || 'left',
      })),
    [columns],
  )

  const rowStyles = useMemo(
    () => (striped ? [styles.rowEven, styles.rowOdd] : [undefined, undefined]),
    [striped, styles],
  )

  return (
    <View style={styles.tableContainer}>
      <View style={[styles.row, styles.headerRow]} wrap={false} fixed={repeatHeader}>
        {columns.map((col, i) => (
          <View key={i} style={[styles.col, columnLayouts[i]]}>
            <Text style={[styles.headerCell, { textAlign: columnLayouts[i].textAlign }]}>
              {col.header}
            </Text>
          </View>
        ))}
      </View>

      {data.length === 0 && (
        <View style={styles.emptyRow} wrap={false}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      )}

      {data.map((row, rowIndex) => (
        <PdfTableRow
          key={keyExtractor ? keyExtractor(row, rowIndex) : rowIndex}
          row={row}
          columns={columns}
          layouts={columnLayouts}
          rowStyle={rowStyles[rowIndex % 2]}
          styles={styles}
        />
      ))}
    </View>
  )
}

export const PdfTable = React.memo(PdfTableInner) as typeof PdfTableInner
