import type { ZarcRequest } from './types'

export function exportRequestAsCsv(request: ZarcRequest) {
  const lines: string[] = []
  lines.push('Sessão;Campo;Valor')

  lines.push(`Produtor;CPF/CNPJ;${request.produtor.cpfCnpj}`)
  lines.push(`Produtor;Nome;${request.produtor.nome}`)
  lines.push(`Produtor;Tipo Produtor;${request.produtor.tipoProdutor}`)

  lines.push(`Propriedade;CAR;${request.propriedade.car}`)
  lines.push(`Propriedade;Nome;${request.propriedade.nome}`)

  request.analisesSolo.forEach((a, idx) => {
    lines.push(
      `Análises de solo ${idx + 1};Data/Camada/Argila/P/K/Ca/Mg;${a.dataColeta} / ${a.camada} / ${
        a.argila
      } / ${a.p} / ${a.k} / ${a.ca} / ${a.mg}`,
    )
  })

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `zarc_solicitacao_${request.id}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportRequestAsPdf(request: ZarcRequest) {
  const content = [
    `Relatório técnico (mock) - Solicitação ZARC ${request.id}`,
    '',
    `Produtor: ${request.produtor.nome} (${request.produtor.cpfCnpj})`,
    `Propriedade: ${request.propriedade.nome} - CAR ${request.propriedade.car}`,
    `Talhão: ${request.talhao.areaHa.toFixed(2)} ha - Cultura ${request.talhao.cultura}`,
    '',
    'Este PDF é apenas uma simulação frontend (mock).',
  ].join('\n')

  const blob = new Blob([content], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `zarc_relatorio_${request.id}.pdf`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

