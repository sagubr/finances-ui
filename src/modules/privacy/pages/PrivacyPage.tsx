import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getDomainLabel } from '@/lib/domain-labels'
import { formatDateTimePtBr } from '@/utils/date'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { privacyApi } from '../api/privacy.api'
import { accessLogQuery, documentsQuery, usePrivacyMutation } from '../queries/privacy.queries'

export const PrivacyPage = ({ embedded = false }: Readonly<{ embedded?: boolean }>) => {
  const [confirmDeletion, setConfirmDeletion] = useState(false)
  const documents = useQuery(documentsQuery())
  const log = useQuery(accessLogQuery())
  const exportData = usePrivacyMutation(() => privacyApi.requestExport())
  const deletion = usePrivacyMutation(() => privacyApi.requestDeletion())
  const consent = usePrivacyMutation((documentId: string) =>
    privacyApi.consent({ documentId, purpose: 'Uso do serviço financeiro' }),
  )
  return (
    <div className="flex flex-col gap-6">
      {!embedded && (
        <header className="border-b pb-5">
          <h1 className="font-heading text-2xl font-semibold">Privacidade</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Consentimentos, portabilidade e exclusão dos seus dados.
          </p>
        </header>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Exportar meus dados</CardTitle>
            <CardDescription>A API prepara um pacote seguro para download.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button disabled={exportData.isPending} onClick={() => exportData.mutate(undefined)}>
              Solicitar exportação
            </Button>
            {exportData.data && (
              <p className="text-sm">
                Solicitação criada. Consulte novamente após o processamento.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>Excluir minha conta</CardTitle>
            <CardDescription>
              A solicitação respeita o período de segurança antes da execução.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {confirmDeletion ? (
              <div className="space-y-3">
                <p className="text-sm">
                  A conta entrará em período de carência. Dados sujeitos a retenção legal não são
                  removidos antes do prazo aplicável.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    disabled={deletion.isPending}
                    onClick={() => deletion.mutate(undefined)}
                  >
                    Confirmar solicitação
                  </Button>
                  <Button variant="outline" onClick={() => setConfirmDeletion(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="destructive" onClick={() => setConfirmDeletion(true)}>
                Solicitar exclusão
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Documentos legais vigentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {documents.data?.items.map((document) => (
            <div
              className="flex items-center justify-between gap-3 border-b pb-3"
              key={document.id}
            >
              <div>
                <p className="font-medium">{document.title}</p>
                <p className="text-muted-foreground text-sm">
                  {getDomainLabel(document.kind)} · versão {document.version}
                </p>
              </div>
              <Button
                render={
                  <a
                    aria-label={`Abrir ${document.title}`}
                    href={document.contentUri}
                    rel="noreferrer"
                    target="_blank"
                  />
                }
                nativeButton={false}
                variant="outline"
                size="sm"
              >
                Abrir
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={consent.isPending}
                onClick={() => consent.mutate(document.id)}
              >
                Aceitar
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Acessos a dados sensíveis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {log.data?.items.map((item) => (
            <div className="border-b pb-3" key={item.id}>
              <p className="font-medium">
                {item.action} · {item.resourceType}
              </p>
              <p className="text-muted-foreground text-sm">
                {item.purpose} · {formatDateTimePtBr(item.occurredAt)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
