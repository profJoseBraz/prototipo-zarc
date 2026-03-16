import type { ZarcRequest } from './types'
import { getStatusLabel, getStatusPillClass } from './statusUtils'
import { exportRequestAsCsv, exportRequestAsPdf } from './exportUtils'
import { useMemo, useState } from 'react'

interface Props {
  request: ZarcRequest
  onBack: () => void
  onBackToReview: () => void
}

export function ZarcSend({ request, onBack, onBackToReview }: Props) {
  const [sendingResult, setSendingResult] = useState<'NONE' | 'SUCCESS' | 'ERROR'>('NONE')

  const allValid = useMemo(() => Object.values(request.validacoes).every(Boolean), [request])

  const canSend =
    request.status === 'PRONTA_ENVIO' ||
    request.status === 'EM_REVISAO' ||
    request.status === 'EM_ELABORACAO'

  const handleConfirmSend = (success: boolean) => {
    setSendingResult(success ? 'SUCCESS' : 'ERROR')
  }

  return (
    <div className="panel">
      <section className="section">
        <div className="section-header between">
          <div>
            <h2>Envio para Integração ZARC</h2>
            <p className="section-subtitle">
              Confirme o envio, visualize os dados consolidados e acompanhe o resultado (mock).
            </p>
          </div>
          <div className="header-actions-inline">
            <span className={getStatusPillClass(request.status)}>{getStatusLabel(request.status)}</span>
            <button className="btn ghost" onClick={onBack}>
              Voltar ⬅️
            </button>
          </div>
        </div>

        <div className="detail-header-grid">
          <div>
            <strong>ID Solicitação:</strong> {request.id}
          </div>
          <div>
            <strong>Status Atual:</strong> {getStatusLabel(request.status)}
          </div>
          <div>
            <strong>Data da Solicitação:</strong>{' '}
            {new Date(request.dataSolicitacao).toLocaleDateString('pt-BR')}
          </div>
          <div>
            <strong>Agrônomo Responsável:</strong> {request.agronomoResponsavel}
          </div>
        </div>

        <div className="detail-actions-row">
          <button className="btn ghost" onClick={() => exportRequestAsCsv(request)}>
            Baixar CSV
          </button>
          <button className="btn ghost" onClick={() => exportRequestAsPdf(request)}>
            Gerar PDF
          </button>
          <button className="btn secondary" onClick={onBackToReview}>
            Voltar para Revisão 📝
          </button>
        </div>
      </section>

      <section className="section">
        <h3 className="section-title">Resumo da Solicitação</h3>
        <div className="two-column">
          <Field label="Produtor" value={request.produtor.nome} />
          <Field label="CPF/CNPJ" value={request.produtor.cpfCnpj} />
          <Field label="Tipo Produtor" value={request.produtor.tipoProdutor} />
          <Field label="CAR" value={request.propriedade.car} />
          <Field label="Propriedade" value={request.propriedade.nome} />
          <Field label="Município" value={request.propriedade.municipio} />
          <Field label="Safra" value={request.talhao.safra} />
          <Field label="Projeto de Custeio" value={request.talhao.projetoCusteio} />
          <Field label="Talhão" value="Talhão 01" />
          <Field label="Área do Talhão" value={`${request.talhao.areaHa.toFixed(2)} ha`} />
          <Field label="Cultura" value={request.talhao.cultura} />
          <Field
            label="Data de Plantio"
            value={new Date(request.talhao.dataPlantio).toLocaleDateString('pt-BR')}
          />
        </div>
      </section>

      <section className="section">
        <h3 className="section-title">Validações para Envio</h3>
        <div className="validations-grid">
          <ValidationItem label="Produtor identificado" ok={request.validacoes.produtorIdentificado} />
          <ValidationItem label="CAR selecionado" ok={request.validacoes.carSelecionado} />
          <ValidationItem label="Talhão desenhado dentro do CAR" ok={request.validacoes.talhaoDentroCar} />
          <ValidationItem
            label="Cultura informada e validada"
            ok={request.validacoes.culturaValidada}
          />
          <ValidationItem
            label="Data de plantio informada"
            ok={request.validacoes.dataPlantioInformada}
          />
          <ValidationItem
            label="Análise de solo vinculada ao talhão"
            ok={request.validacoes.analiseSoloVinculada}
          />
          <ValidationItem label="Manejos cadastrados" ok={request.validacoes.manejosCadastrados} />
          <ValidationItem
            label="Cobertura do solo informada"
            ok={request.validacoes.coberturaSoloInformada}
          />
          <ValidationItem
            label="Histórico produtivo informado"
            ok={request.validacoes.historicoProdutivoInformado}
          />
          <ValidationItem
            label="Plantio em contorno informado"
            ok={request.validacoes.plantioContornoInformado}
          />
        </div>
        {!allValid && (
          <p className="hint">
            A solicitação não pode ser enviada ao ZARC enquanto houver pendências obrigatórias.
          </p>
        )}
      </section>

      <section className="section">
        <h3 className="section-title">Dados da Integração</h3>
        <div className="two-column">
          <Field label="Ambiente de envio" value={request.integracao?.ambienteEnvio ?? 'Produção'} />
          <Field label="Versão do layout ZARC" value={request.integracao?.versaoLayout ?? 'v1.0'} />
          <Field
            label="Data/Hora prevista do envio"
            value={
              request.integracao
                ? new Date(request.integracao.dataHoraPrevistaEnvio).toLocaleString('pt-BR')
                : '11/03/2026 14:35'
            }
          />
          <Field
            label="Usuário responsável pelo envio"
            value={request.integracao?.usuarioResponsavelEnvio ?? request.agronomoResponsavel}
          />
        </div>
      </section>

      <section className="section">
        <h3 className="section-title">Resultado do Envio (mock)</h3>
        {sendingResult === 'NONE' && (
          <div className="hint">
            Escolha simular um envio bem-sucedido ou com erro para visualizar os diferentes cenários.
          </div>
        )}
        {sendingResult === 'SUCCESS' && (
          <div className="result success">
            <h4>Resultado do Envio</h4>
            <p>
              <strong>Status da Integração:</strong> Enviado com sucesso ✅
            </p>
            <p>
              <strong>Data/Hora do envio:</strong> 11/03/2026 14:36
            </p>
            <p>
              <strong>Protocolo ZARC:</strong> ZARC-2026-000987
            </p>
            <p>
              <strong>Mensagem de retorno:</strong> Solicitação recebida com sucesso pelo serviço ZARC.
            </p>
            <button className="btn primary" onClick={onBack}>
              Ok
            </button>
          </div>
        )}
        {sendingResult === 'ERROR' && (
          <div className="result error">
            <h4>Resultado do Envio</h4>
            <p>
              <strong>Status da Integração:</strong> Erro no envio ❌
            </p>
            <p>
              <strong>Data/Hora da tentativa:</strong> 11/03/2026 14:36
            </p>
            <p>
              <strong>Mensagem de retorno:</strong> Falha ao processar a cultura informada. Cultura
              não encontrada no layout ZARC.
            </p>
            <div className="result-actions">
              <button className="btn secondary" onClick={onBackToReview}>
                Voltar para revisão 📝
              </button>
              <button className="btn primary" onClick={() => setSendingResult('NONE')}>
                Tentar novo envio 🔁
              </button>
            </div>
          </div>
        )}

        <div className="footer-nav">
          <button className="btn ghost" onClick={onBack}>
            Cancelar ❌
          </button>
          <div className="footer-nav-right">
            <button
              className="btn success"
              disabled={!canSend || !allValid}
              onClick={() => handleConfirmSend(true)}
            >
              Confirmar envio ao ZARC ✅
            </button>
            <button
              className="btn primary"
              disabled={!canSend}
              onClick={() => handleConfirmSend(false)}
            >
              Simular envio com erro ❌
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

interface FieldProps {
  label: string
  value: string
}

function Field({ label, value }: FieldProps) {
  return (
    <div className="field-readonly">
      <span className="field-label">{label}</span>
      <span className="field-value">{value}</span>
    </div>
  )
}

interface ValidationItemProps {
  label: string
  ok: boolean
}

function ValidationItem({ label, ok }: ValidationItemProps) {
  return (
    <div className={`validation-item ${ok ? 'ok' : 'pending'}`}>
      <span className="validation-icon">{ok ? '✔' : '!'}</span>
      <span>{label}</span>
    </div>
  )
}

