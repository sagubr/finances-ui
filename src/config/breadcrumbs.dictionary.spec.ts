import { describe, expect, it } from 'vitest'
import { getBreadcrumbLabel } from './breadcrumbs.dictionary'

describe('breadcrumbs.dictionary', () => {
  it('traduz rotas principais corretamente', () => {
    expect(getBreadcrumbLabel('home')).toBe('Início')
    expect(getBreadcrumbLabel('explore')).toBe('Explorar')
    expect(getBreadcrumbLabel('views')).toBe('Pipelines de dados')
    expect(getBreadcrumbLabel('dashboards')).toBe('Dashboards')
    expect(getBreadcrumbLabel('collections')).toBe('Coleções')
    expect(getBreadcrumbLabel('financial-structure')).toBe('Estrutura financeira')
    expect(getBreadcrumbLabel('transactions')).toBe('Transações')
    expect(getBreadcrumbLabel('imports')).toBe('Importação')
    expect(getBreadcrumbLabel('privacy')).toBe('Privacidade e dados')
    expect(getBreadcrumbLabel('investment-accounts')).toBe('Contas de investimento')
    expect(getBreadcrumbLabel('comparison')).toBe('Comparativo mensal')
  })

  it('traduz entidades do módulo de negócio e datamart', () => {
    expect(getBreadcrumbLabel('business')).toBe('Negócio')
    expect(getBreadcrumbLabel('countries')).toBe('Países')
    expect(getBreadcrumbLabel('states')).toBe('Estados')
    expect(getBreadcrumbLabel('managerial-regions')).toBe('Regiões Gerenciais')
    expect(getBreadcrumbLabel('sales-rooms')).toBe('Salas de Vendas')
    expect(getBreadcrumbLabel('owner-divisions')).toBe('Divisões de Proprietário')
    expect(getBreadcrumbLabel('commercial-managers')).toBe('Gerentes Comerciais')
    expect(getBreadcrumbLabel('manager-roles')).toBe('Tipos de Atuação')
    expect(getBreadcrumbLabel('networks')).toBe('Redes Comerciais')
    expect(getBreadcrumbLabel('network-types')).toBe('Tipos de Rede')
  })

  it('traduz rotas de configurações e administração', () => {
    expect(getBreadcrumbLabel('settings')).toBe('Configurações')
    expect(getBreadcrumbLabel('data-sources')).toBe('Fontes de Dados')
    expect(getBreadcrumbLabel('catalog')).toBe('Catálogo')
    expect(getBreadcrumbLabel('operations')).toBe('Operações')
    expect(getBreadcrumbLabel('materializations')).toBe('Materializações')
    expect(getBreadcrumbLabel('members')).toBe('Membros')
    expect(getBreadcrumbLabel('groups')).toBe('Grupos')
    expect(getBreadcrumbLabel('permissions')).toBe('Permissões')
  })

  it('aplica fallback inteligente para rotas não cadastradas', () => {
    expect(getBreadcrumbLabel('custom-module-name')).toBe('Custom Module Name')
    expect(getBreadcrumbLabel('audit_logs')).toBe('Audit Logs')
  })
})
