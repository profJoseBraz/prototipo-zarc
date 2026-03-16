import type { ZarcRequest } from './types'
import { getStatusLabel, getStatusPillClass } from './statusUtils'
import { exportRequestAsCsv, exportRequestAsPdf } from './exportUtils'
import { ZarcMap } from './ZarcMap'

interface Props {
  request: ZarcRequest
  onBack: () => void
  onEdit: () => void
  onOpenSend: (id: string) => void
}

export function ZarcRequestDetail({ request, onBack, onEdit, onOpenSend }: Props) {
  const canEdit = request.status === 'EM_ELABORACAO'

  return (
    <div className="panel">
      <section className="section">
        <div className="section-header between">
          <div>
            <h2>Solicitação ZARC</h2>
            <p className="section-subtitle">Visualização detalhada da solicitação e resultado.</p>
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
          <button className="btn primary" onClick={onEdit} disabled={!canEdit}>
            Editar ✏️
          </button>
          <button className="btn success" onClick={() => onOpenSend(request.id)}>
            Enviar / Integração ZARC
          </button>
        </div>
      </section>

      <section className="section">
        <h3 className="section-title">Produtor</h3>
        <div className="two-column">
          <Field label="CPF / CNPJ" value={request.produtor.cpfCnpj} />
          <Field label="Nome" value={request.produtor.nome} />
          <Field label="Tipo Produtor" value={request.produtor.tipoProdutor} />
          <Field label="Tipo Matrícula Cooperado" value={request.produtor.tipoMatricula} />
          <Field label="Matrícula Cooperado" value={request.produtor.matricula} />
        </div>
      </section>

      <section className="section">
        <h3 className="section-title">Propriedade</h3>
        <div className="two-column">
          <Field label="Número CAR" value={request.propriedade.car} />
          <Field label="Nome da Propriedade" value={request.propriedade.nome} />
          <Field label="Município" value={request.propriedade.municipio} />
          <Field label="Código IBGE" value={request.propriedade.codigoIbge} />
        </div>
      </section>

      <section className="section">
        <h3 className="section-title">Mapa da Solicitação</h3>
        <div className="map-mock">
          <ZarcMap request={request} />
          <div className="map-legend">
            <span className="legend-box car" /> Polígono do CAR
            <span className="legend-box field" /> Polígono do Talhão
          </div>
        </div>
      </section>

      <section className="section">
        <h3 className="section-title">Talhão</h3>
        <div className="two-column">
          <Field label="Área do Talhão" value={`${request.talhao.areaHa.toFixed(2)} ha`} />
          <Field label="Cultura" value={request.talhao.cultura} />
          <Field
            label="Data de Plantio"
            value={new Date(request.talhao.dataPlantio).toLocaleDateString('pt-BR')}
          />
          <Field label="Safra" value={request.talhao.safra} />
          <Field label="Projeto de Custeio" value={request.talhao.projetoCusteio} />
          <Field
            label="Plantio em contorno"
            value={request.talhao.plantioEmContorno ? 'Sim' : 'Não'}
          />
        </div>
      </section>

      <section className="section">
        <h3 className="section-title">Análises de Solo</h3>
        <div className="table-wrapper">
          <table className="table small">
            <thead>
              <tr>
                <th>Data Coleta</th>
                <th>Camada</th>
                <th>Argila</th>
                <th>P</th>
                <th>K</th>
                <th>Ca</th>
                <th>Mg</th>
              </tr>
            </thead>
            <tbody>
              {request.analisesSolo.map((a, idx) => (
                <tr key={idx}>
                  <td>{new Date(a.dataColeta).toLocaleDateString('pt-BR')}</td>
                  <td>{a.camada}</td>
                  <td>{a.argila}</td>
                  <td>{a.p}</td>
                  <td>{a.k}</td>
                  <td>{a.ca}</td>
                  <td>{a.mg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h3 className="section-title">Operações de Manejo</h3>
        <div className="table-wrapper">
          <table className="table small">
            <thead>
              <tr>
                <th>Operação</th>
                <th>Tipo</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {request.manejos.map((m, idx) => (
                <tr key={idx}>
                  <td>{m.operacao}</td>
                  <td>{m.tipo}</td>
                  <td>{new Date(m.data).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h3 className="section-title">Cobertura do Solo</h3>
        {request.coberturas.map((c, idx) => (
          <div className="two-column" key={idx}>
            <Field label="Percentual de Palhada" value={`${c.percentualPalhada}%`} />
            <Field
              label="Data da Avaliação"
              value={new Date(c.dataAvaliacao).toLocaleDateString('pt-BR')}
            />
          </div>
        ))}
      </section>

      <section className="section">
        <h3 className="section-title">Histórico da Área</h3>
        {request.historicos.map((h, idx) => (
          <div className="two-column" key={idx}>
            <Field label="Cultura Anterior" value={h.culturaAnterior} />
            <Field label="Plantio" value={new Date(h.plantio).toLocaleDateString('pt-BR')} />
            <Field label="Colheita" value={new Date(h.colheita).toLocaleDateString('pt-BR')} />
            <Field label="Integração Lavoura Pecuária" value={h.ilp} />
          </div>
        ))}
      </section>

      {request.resultadoAnalise && (
        <section className="section">
          <h3 className="section-title">Resultado da Análise ZARC</h3>
          <div className="two-column">
            <Field label="Status da análise" value={request.resultadoAnalise.statusAnalise} />
            <Field
              label="Classificação de risco climático"
              value={request.resultadoAnalise.classificacaoRisco}
            />
            <Field
              label="Janela recomendada de plantio"
              value={request.resultadoAnalise.janelaPlantio}
            />
            <Field
              label="Índice de aptidão climática"
              value={`${request.resultadoAnalise.indiceAptidao}%`}
            />
          </div>
          <p className="text-block">{request.resultadoAnalise.recomendacaoTecnica}</p>
        </section>
      )}
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

