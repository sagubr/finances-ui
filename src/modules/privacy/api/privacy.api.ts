import apiClient from '@/api/client'
import {
  accessLogPageSchema,
  documentListSchema,
  privacyRequestSchema,
} from '../models/privacy.schemas'
import type { AccessLog, LegalDocument, Page, PrivacyRequest } from '../models/privacy.types'
const idempotency = () => ({ 'idempotency-key': crypto.randomUUID() })
export const privacyApi = {
  documents: async (): Promise<{ items: LegalDocument[] }> =>
    documentListSchema.parse((await apiClient.get('/privacy/documents')).data),
  consent: async (input: { documentId: string; purpose: string }): Promise<void> => {
    await apiClient.post('/privacy/consents', input, { headers: idempotency() })
  },
  requestExport: async (): Promise<PrivacyRequest> =>
    privacyRequestSchema.parse(
      (await apiClient.post('/privacy/exports', {}, { headers: idempotency() })).data,
    ),
  exportStatus: async (id: string): Promise<PrivacyRequest> =>
    privacyRequestSchema.parse((await apiClient.get(`/privacy/exports/${id}`)).data),
  requestDeletion: async (): Promise<PrivacyRequest> =>
    privacyRequestSchema.parse(
      (await apiClient.post('/privacy/deletion', {}, { headers: idempotency() })).data,
    ),
  cancelDeletion: async (id: string): Promise<void> => {
    await apiClient.post(`/privacy/deletion/${id}/cancel`, {})
  },
  accessLog: async (): Promise<Page<AccessLog>> =>
    accessLogPageSchema.parse(
      (await apiClient.get('/privacy/access-log', { params: { limit: 100 } })).data,
    ),
}
