import { Image, StyleSheet, Text, View } from '@react-pdf/renderer'

const ACCENT = '#D4AF35'
const ACCENT_LIGHT = '#F8F2DD'
const GRAY_DARK = '#111827'
const GRAY_MID = '#374151'
const GRAY_LIGHT = '#6b7280'
const BORDER = '#e5e7eb'

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  accentBar: {
    height: 4,
    backgroundColor: ACCENT,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 10,
    paddingTop: 10,
  },
  logoCol: {
    justifyContent: 'center',
    paddingRight: 14,
    borderRightWidth: 1,
    borderRightColor: BORDER,
    marginRight: 14,
  },
  logo: {
    height: 36,
    width: 36,
  },
  titleCol: {
    flex: 1,
    justifyContent: 'center',
  },
  reportLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: ACCENT,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: GRAY_DARK,
  },
  subtitle: {
    fontSize: 9,
    color: GRAY_MID,
    marginTop: 3,
  },
  metaCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  metaLabel: {
    fontSize: 7,
    color: GRAY_LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 4,
  },
  metaValue: {
    fontSize: 8,
    color: GRAY_MID,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: ACCENT_LIGHT,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
    alignSelf: 'flex-end',
  },
  badgeText: {
    fontSize: 7,
    color: ACCENT,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})

export interface PdfReportHeaderProps {
  title: string
  subtitle?: string
  reportType?: string
  printedBy?: string
  generatedAt?: string
}

export function PdfReportHeader({
  title,
  subtitle,
  reportType = 'Relatório Informativo',
  printedBy,
  generatedAt,
}: PdfReportHeaderProps) {
  const dateStr =
    generatedAt ?? new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

  return (
    <View style={styles.wrapper} fixed>
      <View style={styles.accentBar} />

      <View style={styles.container}>
        <View style={styles.logoCol}>
          <Image src="/icon-512-dark.png" style={styles.logo} />
        </View>

        <View style={styles.titleCol}>
          <Text style={styles.reportLabel}>{reportType}</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <View style={styles.metaCol}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Gerado em:</Text>
            <Text style={styles.metaValue}>{dateStr}</Text>
          </View>

          {printedBy ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Por:</Text>
              <Text style={styles.metaValue}>{printedBy}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  )
}
