import type { ZarcStatus } from './types'

export function getStatusLabel(status: ZarcStatus): string {
  switch (status) {
    case 'EM_ELABORACAO':
      return 'Em elaboração'
    case 'EM_REVISAO':
      return 'Em análise'
    case 'PRONTA_ENVIO':
      return 'Em análise'
    case 'ENVIADA':
      return 'Enviada'
    case 'RET_SUCESSO':
      return 'Resultado'
    case 'RET_ERRO':
      return 'Erro'
    default:
      return status
  }
}

export function getStatusPillClass(status: ZarcStatus): string {
  switch (status) {
    case 'EM_ELABORACAO':
      return 'status-pill purple'
    case 'EM_REVISAO':
    case 'PRONTA_ENVIO':
      return 'status-pill yellow'
    case 'ENVIADA':
      return 'status-pill blue'
    case 'RET_SUCESSO':
      return 'status-pill green'
    case 'RET_ERRO':
      return 'status-pill red'
    default:
      return 'status-pill'
  }
}

