import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'
import React from 'react'

interface SummaryCardProps {
  icon: LucideIcon
  title: string
  text: string
}

export const SummaryCard: React.FC<SummaryCardProps> = React.memo(({ icon: Icon, title, text }) => {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3">
        <Icon className="text-primary size-5" />
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">{text}</CardContent>
    </Card>
  )
})

SummaryCard.displayName = 'SummaryCard'
