import { useMemo, useState } from 'react'
import type { ZarcRequest, ZarcStatus } from './types'
import { getStatusLabel, getStatusPillClass } from './statusUtils'
import { ZarcMap } from './ZarcMap'

interface Props {
  requests: ZarcRequest[]
  onOpenDetail: (id: string) => void
  onOpenWizard: (id?: string) => void
}

export function ZarcDashboard({ requests, onOpenDetail, onOpenWizard }: Props) {
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [nomeProdutor, setNomeProdutor] = useState('')
  const [car, setCar] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [safra, setSafra] = useState('')
  const [cultura, setCultura] = useState('')
  const [status, setStatus] = useState<'TODOS' | ZarcStatus>('TODOS')
  const [selectedForMapId, setSelectedForMapId] = useState<string | null>(null)

  const counts = requests.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const totalBy = (keys: string[]) => keys.reduce((sum, k) => sum + (counts[k] ?? 0), 0)

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (cpfCnpj && !r.produtor.cpfCnpj.toLowerCase().includes(cpfCnpj.toLowerCase())) {
        return false
      }
      if (nomeProdutor && !r.produtor.nome.toLowerCase().includes(nomeProdutor.toLowerCase())) {
        return false
      }
      if (car && !r.propriedade.car.toLowerCase().includes(car.toLowerCase())) {
        return false
      }
      if (municipio && !r.propriedade.municipio.toLowerCase().includes(municipio.toLowerCase())) {
        return false
      }
      if (safra && !r.talhao.safra.toLowerCase().includes(safra.toLowerCase())) {
        return false
      }
      if (cultura && !r.talhao.cultura.toLowerCase().includes(cultura.toLowerCase())) {
        return false
      }
      if (status !== 'TODOS' && r.status !== status) {
        return false
      }
      return true
    })
  }, [requests, cpfCnpj, nomeProdutor, car, municipio, safra, cultura, status])

  const handleClearFilters = () => {
    setCpfCnpj('')
    setNomeProdutor('')
    setCar('')
    setMunicipio('')
    setSafra('')
    setCultura('')
    setStatus('TODOS')
  }

  const selectedForMap =
    filteredRequests.find((r) => r.id === selectedForMapId) ?? filteredRequests[0] ?? null

  return (
    <div className="panel">
      <section className="section">
        <h2>📊 Status das Solicitações</h2>
        <div className="status-grid">
          <StatusCard label="Em elaboração" value={totalBy(['EM_ELABORACAO'])} color="purple" />
          <StatusCard label="Enviadas" value={totalBy(['ENVIADA'])} color="blue" />
          <StatusCard label="Em análise" value={totalBy(['EM_REVISAO', 'PRONTA_ENVIO'])} color="yellow" />
          <StatusCard label="Aprovadas" value={totalBy(['RET_SUCESSO'])} color="green" />
          <StatusCard label="Com erro" value={totalBy(['RET_ERRO'])} color="red" />
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2>🔎 Filtros</h2>
            <p className="section-subtitle">
              Preencha os campos abaixo e clique em Pesquisar para filtrar a lista de solicitações.
            </p>
          </div>
        </div>

        <div className="filters-grid">
          <FilterField
            label="CPF/CNPJ do produtor"
            placeholder="123.456.789-00"
            value={cpfCnpj}
            onChange={setCpfCnpj}
          />
          <FilterField
            label="Nome do produtor"
            placeholder="João da Silva"
            value={nomeProdutor}
            onChange={setNomeProdutor}
          />
          <FilterField label="CAR" placeholder="PR-4123456" value={car} onChange={setCar} />
          <FilterField
            label="Município"
            placeholder="Campo Mourão"
            value={municipio}
            onChange={setMunicipio}
          />
          <FilterField label="Safra" placeholder="2024/2025" value={safra} onChange={setSafra} />
          <FilterField label="Cultura" placeholder="Soja" value={cultura} onChange={setCultura} />
          <div className="field">
            <label>Período solic.</label>
            <input placeholder="(mock) não filtra por data ainda" disabled />
          </div>
          <div className="field">
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => {
                const v = e.target.value as 'TODOS' | ZarcStatus
                setStatus(v)
              }}
            >
              <option value="TODOS">Todos</option>
              <option value="EM_ELABORACAO">Em elaboração</option>
              <option value="ENVIADA">Enviada</option>
              <option value="EM_REVISAO">Em revisão</option>
              <option value="PRONTA_ENVIO">Pronta para envio</option>
              <option value="RET_SUCESSO">Retornada com sucesso</option>
              <option value="RET_ERRO">Retornada com erro</option>
            </select>
          </div>
        </div>

        <div className="filters-actions">
          <button className="btn primary">Pesquisar 🔎</button>
          <button className="btn ghost" type="button" onClick={handleClearFilters}>
            Limpar filtros 🧹
          </button>
          <button className="btn success" onClick={() => onOpenWizard()}>
            Nova solicitação ZARC
          </button>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>📄 Lista de solicitações</h2>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Produtor</th>
                <th>CAR</th>
                <th>Município</th>
                <th>Cultura</th>
                <th>Safra</th>
                <th>Status</th>
                <th>Data</th>
                <th>Agrônomo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((r) => (
                <tr
                  key={r.id}
                  className={selectedForMap?.id === r.id ? 'table-row-selected' : ''}
                  onClick={() => setSelectedForMapId(r.id)}
                >
                  <td>{r.id}</td>
                  <td>{r.produtor.nome}</td>
                  <td>{r.propriedade.car}</td>
                  <td>{r.propriedade.municipio}</td>
                  <td>{r.talhao.cultura}</td>
                  <td>{r.talhao.safra}</td>
                  <td>
                    <span className={getStatusPillClass(r.status)}>{getStatusLabel(r.status)}</span>
                  </td>
                  <td>{new Date(r.dataSolicitacao).toLocaleDateString('pt-BR')}</td>
                  <td>{r.agronomoResponsavel}</td>
                  <td className="table-actions">
                    <button className="btn icon" onClick={() => onOpenDetail(r.id)} title="Visualizar">
                      👁️
                    </button>
                    <button
                      className="btn icon"
                      onClick={() => onOpenWizard(r.id)}
                      disabled={r.status !== 'EM_ELABORACAO'}
                      title={r.status === 'EM_ELABORACAO' ? 'Editar' : 'Somente leitura'}
                    >
                      ✏️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2>🌎 Mapa das solicitações</h2>
        <div className="map-mock">
          {selectedForMap && <ZarcMap request={selectedForMap} />}
          <div className="map-legend">
            <span className="legend-box car" /> Polígono do CAR
            <span className="legend-box field" /> Polígono do Talhão
          </div>
        </div>
      </section>
    </div>
  )
}

interface StatusCardProps {
  label: string
  value: number
  color: 'purple' | 'blue' | 'yellow' | 'green' | 'red'
}

function StatusCard({ label, value, color }: StatusCardProps) {
  return (
    <div className={`status-card status-${color}`}>
      <span className="status-card-label">{label}</span>
      <span className="status-card-value">{value}</span>
    </div>
  )
}

interface FilterFieldProps {
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

function FilterField({ label, placeholder, value, onChange }: FilterFieldProps) {
  return (
    <div className="field">
      <label>{label}</label>
      <input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

