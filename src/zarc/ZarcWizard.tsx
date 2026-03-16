import { useMemo, useState } from 'react'
import type {
  ZarcRequest,
  FieldValidations,
  TalhaoInfo,
  SoilAnalysisPoint,
  ManagementOperation,
  SoilCover,
  ProductionHistory,
  Property,
} from './types'
import { mockRequests } from './mockData'
import { ZarcTalhaoDrawMap } from './ZarcTalhaoDrawMap'
import { ZarcSoilAnalysisMap } from './ZarcSoilAnalysisMap'

type Step =
  | 'produtor'
  | 'propriedade'
  | 'analise'
  | 'manejo'
  | 'cobertura'
  | 'historico'
  | 'revisao'

interface Props {
  existing: ZarcRequest | null
  onCancel: () => void
  onSave: (request: ZarcRequest) => void
  onFinish: (request: ZarcRequest) => void
}

const base = mockRequests[0]

export function ZarcWizard({ existing, onCancel, onSave, onFinish }: Props) {
  const [step, setStep] = useState<Step>('produtor')

  const [producer, setProducer] = useState(
    existing?.produtor ?? {
      cpfCnpj: '',
      nome: '',
      tipoProdutor: 'Proprietário',
      tipoMatricula: '',
      matricula: '',
    },
  )
  const [property, setProperty] = useState<Property>(
    existing?.propriedade ?? {
      car: '',
      nome: '',
      municipio: '',
      codigoIbge: '',
      carPolygon: undefined,
    },
  )
  const [talhao, setTalhao] = useState<TalhaoInfo>(() => {
    const baseTalhao =
      existing?.talhao ??
      ({
        areaHa: 0,
        cultura: '',
        dataPlantio: '',
        safra: '',
        projetoCusteio: '',
        plantioEmContorno: false,
        talhaoPolygon: undefined,
      } as TalhaoInfo)
    return baseTalhao
  })
  const [analises, setAnalises] = useState<SoilAnalysisPoint[]>(existing?.analisesSolo ?? base.analisesSolo)
  const [manejos, setManejos] = useState<ManagementOperation[]>(existing?.manejos ?? [])
  const [coberturas, setCoberturas] = useState<SoilCover[]>(existing?.coberturas ?? [])
  const [historicos, setHistoricos] = useState<ProductionHistory[]>(existing?.historicos ?? [])

  const [validacoes, setValidacoes] = useState<FieldValidations>(
    existing?.validacoes ?? {
      produtorIdentificado: false,
      carSelecionado: false,
      talhaoDentroCar: false,
      culturaValidada: false,
      dataPlantioInformada: false,
      analiseSoloVinculada: false,
      manejosCadastrados: false,
      coberturaSoloInformada: false,
      historicoProdutivoInformado: false,
      plantioContornoInformado: false,
    },
  )
  const [producerSelecionado, setProducerSelecionado] = useState<boolean>(!!existing)
  const [drawingTalhao, setDrawingTalhao] = useState(false)
  const [selectedAnalysisIndex, setSelectedAnalysisIndex] = useState<number | null>(null)
  const [showProducerModal, setShowProducerModal] = useState(false)
  const [showPropertyModal, setShowPropertyModal] = useState(false)
  const [showProjetoModal, setShowProjetoModal] = useState(false)
  const [producerTipoMatricula, setProducerTipoMatricula] = useState('')
  const [producerMatricula, setProducerMatricula] = useState('')
  const [producerCpfCnpj, setProducerCpfCnpj] = useState('')
  const [producerNome, setProducerNome] = useState('')
  const [propertyCar, setPropertyCar] = useState('')
  const [propertyNome, setPropertyNome] = useState('')
  const [propertyMunicipio, setPropertyMunicipio] = useState('')
  const [projetoNumeroFiltro, setProjetoNumeroFiltro] = useState('')
  const [novoManejo, setNovoManejo] = useState<ManagementOperation>({
    operacao: '',
    tipo: '',
    data: '',
  })
  const [novaCobertura, setNovaCobertura] = useState<SoilCover>({
    percentualPalhada: 0,
    dataAvaliacao: '',
  })
  const [novoHistorico, setNovoHistorico] = useState<ProductionHistory>({
    culturaAnterior: '',
    plantio: '',
    colheita: '',
    ilp: 'Não',
  })

  const stepsOrder: Step[] = useMemo(
    () => ['produtor', 'propriedade', 'analise', 'manejo', 'cobertura', 'historico', 'revisao'],
    [],
  )

  const currentIndex = stepsOrder.indexOf(step)

  const allProducers = useMemo(
    () => mockRequests.map((r) => r.produtor),
    [],
  )

  const allProperties = useMemo(
    () => mockRequests.map((r) => r.propriedade),
    [],
  )

  const allProjetos = useMemo(
    () =>
      mockRequests.map((r) => ({
        numero: r.talhao.projetoCusteio,
        safra: r.talhao.safra,
        produtor: r.produtor,
      })),
    [],
  )

  const filteredProducers = allProducers.filter((p) => {
    if (producerTipoMatricula && !p.tipoMatricula.toLowerCase().includes(producerTipoMatricula.toLowerCase())) {
      return false
    }
    if (producerMatricula && !p.matricula.toLowerCase().includes(producerMatricula.toLowerCase())) {
      return false
    }
    if (producerCpfCnpj && !p.cpfCnpj.toLowerCase().includes(producerCpfCnpj.toLowerCase())) {
      return false
    }
    if (producerNome && !p.nome.toLowerCase().includes(producerNome.toLowerCase())) {
      return false
    }
    return true
  })

  const filteredProperties = allProperties.filter((p) => {
    if (propertyCar && !p.car.toLowerCase().includes(propertyCar.toLowerCase())) {
      return false
    }
    if (propertyNome && !p.nome.toLowerCase().includes(propertyNome.toLowerCase())) {
      return false
    }
    if (propertyMunicipio && !p.municipio.toLowerCase().includes(propertyMunicipio.toLowerCase())) {
      return false
    }
    return true
  })

  const producerProperties = useMemo(
    () =>
      producerSelecionado
        ? mockRequests
            .filter((r) => r.produtor.cpfCnpj === producer.cpfCnpj)
            .map((r) => r.propriedade)
        : [],
    [producerSelecionado, producer.cpfCnpj],
  )

  const filteredProjetos = allProjetos.filter((p) => {
    if (projetoNumeroFiltro && !p.numero.toLowerCase().includes(projetoNumeroFiltro.toLowerCase())) {
      return false
    }
    if (producer.matricula && p.produtor.matricula !== producer.matricula) {
      return false
    }
    return true
  })

  const goNext = () => {
    if (currentIndex < stepsOrder.length - 1) {
      setStep(stepsOrder[currentIndex + 1])
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setStep(stepsOrder[currentIndex - 1])
    }
  }

  const buildRequest = (status: ZarcRequest['status']): ZarcRequest => ({
    id: existing?.id ?? '000999',
    status,
    dataSolicitacao: existing?.dataSolicitacao ?? new Date().toISOString().slice(0, 10),
    agronomoResponsavel: existing?.agronomoResponsavel ?? base.agronomoResponsavel,
    produtor: producer,
    propriedade: property,
    talhao,
    analisesSolo: analises,
    manejos,
    coberturas,
    historicos,
    validacoes,
    resultadoAnalise: base.resultadoAnalise,
    integracao: base.integracao,
  })

  const handleSaveDraft = () => {
    const req = buildRequest('EM_ELABORACAO')
    onSave(req)
  }

  const handleFinish = () => {
    const allValid = Object.values(validacoes).every(Boolean)
    const status: ZarcRequest['status'] = allValid ? 'PRONTA_ENVIO' : 'EM_REVISAO'
    const req = buildRequest(status)
    onFinish(req)
  }

  const handleAddManejo = () => {
    if (!novoManejo.operacao || !novoManejo.tipo || !novoManejo.data) return
    setManejos((prev) => [...prev, novoManejo])
    setNovoManejo({ operacao: '', tipo: '', data: '' })
    setValidacoes((v) => ({
      ...v,
      manejosCadastrados: true,
    }))
  }

  const handleAddCobertura = () => {
    if (!novaCobertura.percentualPalhada || !novaCobertura.dataAvaliacao) return
    setCoberturas((prev) => [...prev, novaCobertura])
    setNovaCobertura({ percentualPalhada: 0, dataAvaliacao: '' })
    setValidacoes((v) => ({
      ...v,
      coberturaSoloInformada: true,
    }))
  }

  const handleAddHistorico = () => {
    if (!novoHistorico.culturaAnterior || !novoHistorico.plantio || !novoHistorico.colheita) return
    setHistoricos((prev) => [...prev, novoHistorico])
    setNovoHistorico({
      culturaAnterior: '',
      plantio: '',
      colheita: '',
      ilp: 'Não',
    })
    setValidacoes((v) => ({
      ...v,
      historicoProdutivoInformado: true,
      plantioContornoInformado: novoHistorico.ilp === 'Sim' ? true : v.plantioContornoInformado,
    }))
  }

  return (
    <div className="panel">
      <section className="section">
        <div className="section-header between">
          <div>
            <h2>Solicitação ZARC</h2>
            <p className="section-subtitle">
              Wizard guiado para construção, validação e envio da solicitação ZARC.
            </p>
          </div>
          <div className="header-actions-inline">
            <button className="btn ghost" onClick={onCancel}>
              Cancelar ❌
            </button>
            <button className="btn secondary" onClick={handleSaveDraft}>
              Salvar rascunho 💾
            </button>
            <button className="btn success" onClick={handleFinish}>
              Finalizar e seguir para envio ✅
            </button>
          </div>
        </div>

        <ProgressBar steps={stepsOrder} currentStep={step} />
      </section>

      {step === 'produtor' && (
        <section className="section">
          <h3 className="section-title">1 - Identificação do produtor</h3>
          <div className="filters-actions" style={{ marginBottom: '0.6rem' }}>
            <button
              type="button"
              className="btn primary"
              onClick={() => setShowProducerModal(true)}
            >
              Buscar produtor 🔍
            </button>
          </div>
          <div
            className="two-column"
            style={{ gridTemplateColumns: '1fr 1fr 1fr', maxWidth: '630px' }}
          >
            <ReadOnly label="Tipo Matrícula" value={producer.tipoMatricula} />
            <ReadOnly label="Matrícula" value={producer.matricula} />
            <div className="field">
              <label>Tipo produtor</label>
              <select
                value={producer.tipoProdutor}
                onChange={(e) =>
                  setProducer((p) => ({
                    ...p,
                    tipoProdutor: e.target.value as typeof p.tipoProdutor,
                  }))
                }
              >
                <option value="Proprietário">Proprietário</option>
                <option value="Arrendatário">Arrendatário</option>
              </select>
            </div>
          </div>
          <div className="two-column">
            <ReadOnly label="CPF/CNPJ" value={producer.cpfCnpj} />
            <ReadOnly label="Nome" value={producer.nome} />
          </div>

          <h4 className="section-subtitle">Propriedades do produtor (CAR)</h4>
          <div className="table-wrapper">
            <table className="table small">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>CAR</th>
                  <th>Nome</th>
                  <th>Município</th>
                </tr>
              </thead>
              <tbody>
                {producerProperties.map((p, idx) => (
                  <tr
                    key={p.car}
                    className={property.car === p.car ? 'table-row-selected' : ''}
                    onClick={() => {
                      setProperty(p)
                      setValidacoes((v) => ({
                        ...v,
                        produtorIdentificado: true,
                        carSelecionado: true,
                      }))
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{(idx + 1).toString().padStart(3, '0')}</td>
                    <td>{p.car}</td>
                    <td>{p.nome}</td>
                    <td>{p.municipio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 className="section-subtitle" style={{ marginTop: '0.75rem' }}>
            Mapa do CAR selecionado
          </h4>
          <div className="map-mock">
            <ZarcSoilAnalysisMap property={property} talhao={talhao} analises={[]} />
          </div>
        </section>
      )}

      {step === 'propriedade' && (
        <section className="section">
          <h3 className="section-title">2 - Propriedade / Talhão</h3>
          <div className="two-column">
            <ReadOnly label="CAR" value={property.car} />
            <ReadOnly label="Propriedade" value={property.nome} />
            <ReadOnly label="Município" value={property.municipio} />
            <div className="field">
              <label>Projeto custeio</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={talhao.projetoCusteio}
                  onChange={(e) =>
                    setTalhao((t) => ({
                      ...t,
                      projetoCusteio: e.target.value,
                    }))
                  }
                />
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setShowProjetoModal(true)}
                >
                  Buscar projeto
                </button>
              </div>
            </div>
          </div>

          <h4 className="section-subtitle">Mapa da propriedade</h4>

          {!drawingTalhao && (
            <div className="filters-actions" style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn primary"
                onClick={() => setDrawingTalhao(true)}
              >
                Desenhar talhão 📝
              </button>
            </div>
          )}

          <div className="map-mock">
            {drawingTalhao ? (
              <ZarcTalhaoDrawMap
                property={property}
                talhao={talhao}
                onChangeTalhaoPolygon={(coords) => {
                  const newAreaHa = calculatePolygonAreaHa(coords)
                  setTalhao((t) => ({
                    ...t,
                    talhaoPolygon: coords,
                    areaHa: Number.isFinite(newAreaHa) && newAreaHa > 0 ? newAreaHa : t.areaHa,
                  }))
                }}
                onTalhaoDrawn={() => {
                  setValidacoes((v) => ({
                    ...v,
                    talhaoDentroCar: true,
                  }))
                  setDrawingTalhao(false)
                }}
              />
            ) : (
              <ZarcSoilAnalysisMap property={property} talhao={talhao} analises={[]} />
            )}
          </div>

          <h4 className="section-subtitle" style={{ marginTop: '0.75rem' }}>
            Dados do talhão
          </h4>
          <div className="two-column">
            <ReadOnly label="Área do talhão" value={`${talhao.areaHa.toFixed(2)} ha`} />
            <div className="field">
              <label>Plantio em contorno</label>
              <select
                value={talhao.plantioEmContorno ? 'Sim' : 'Não'}
                onChange={(e) => {
                  const isSim = e.target.value === 'Sim'
                  setTalhao((t) => ({
                    ...t,
                    plantioEmContorno: isSim,
                  }))
                  setValidacoes((v) => ({
                    ...v,
                    plantioContornoInformado: true,
                  }))
                }}
              >
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {step === 'analise' && (
        <section className="section">
          <h3 className="section-title">4 - Análises de solo</h3>
          <p className="section-subtitle">
            Visualize os pontos de coleta de solo dentro do talhão da solicitação e selecione as
            análises vinculadas.
          </p>
          <div className="map-mock">
            <ZarcSoilAnalysisMap
              property={property}
              talhao={talhao}
              analises={analises}
              selectedIndex={selectedAnalysisIndex}
              onUpdateAnalysisPoint={(index, lat, lng) => {
                setAnalises((prev) =>
                  prev.map((a, i) => (i === index ? { ...a, lat, lng } : a)),
                )
              }}
            />
          </div>
          <div className="table-wrapper">
            <table className="table small">
              <thead>
                <tr>
                  <th>Data Coleta</th>
                  <th>Camada</th>
                  <th>Argila</th>
                  <th>P</th>
                  <th>K</th>
                  <th>Selecionar</th>
                </tr>
              </thead>
              <tbody>
                {analises.map((a, idx) => (
                  <tr
                    key={idx}
                    className={selectedAnalysisIndex === idx ? 'table-row-selected' : ''}
                    onClick={() => setSelectedAnalysisIndex(idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{new Date(a.dataColeta).toLocaleDateString('pt-BR')}</td>
                    <td>{a.camada}</td>
                    <td>{a.argila}</td>
                    <td>{a.p}</td>
                    <td>{a.k}</td>
                    <td>
                      <input
                        type="checkbox"
                        defaultChecked
                        onChange={() =>
                          setValidacoes((v) => ({
                            ...v,
                            analiseSoloVinculada: true,
                          }))
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {step === 'manejo' && (
        <section className="section">
          <h3 className="section-title">5 - Manejo da cultura</h3>
          <p className="section-subtitle">Adicionar operações de manejo e montar a lista.</p>
          <div className="two-column">
            <div className="field">
              <label>Operação</label>
              <select
                value={novoManejo.operacao}
                onChange={(e) =>
                  setNovoManejo((m) => ({
                    ...m,
                    operacao: e.target.value,
                  }))
                }
              >
                <option value="">Selecione</option>
                <option value="Aração">Aração</option>
                <option value="Gradagem">Gradagem</option>
                <option value="Subsolagem">Subsolagem</option>
                <option value="Escarificação">Escarificação</option>
              </select>
            </div>
            <Editable
              label="Tipo"
              value={novoManejo.tipo}
              onChange={(value) =>
                setNovoManejo((m) => ({
                  ...m,
                  tipo: value,
                }))
              }
            />
            <Editable
              label="Data"
              value={novoManejo.data}
              type="date"
              onChange={(value) =>
                setNovoManejo((m) => ({
                  ...m,
                  data: value,
                }))
              }
            />
          </div>
          <div className="filters-actions">
            <button className="btn primary" type="button" onClick={handleAddManejo}>
              Adicionar manejo ➕
            </button>
          </div>
          {manejos.length > 0 && (
            <div className="table-wrapper" style={{ marginTop: '0.6rem' }}>
              <table className="table small">
                <thead>
                  <tr>
                    <th>Operação</th>
                    <th>Tipo</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {manejos.map((m, idx) => (
                    <tr key={`${m.operacao}-${m.data}-${idx}`}>
                      <td>{m.operacao}</td>
                      <td>{m.tipo}</td>
                      <td>{m.data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {step === 'cobertura' && (
        <section className="section">
          <h3 className="section-title">6 - Cobertura do solo</h3>
          <div className="two-column">
            <Editable
              label="Percentual de palhada"
              value={novaCobertura.percentualPalhada.toString()}
              onChange={(value) =>
                setNovaCobertura((c) => ({
                  ...c,
                  percentualPalhada: Number(value) || 0,
                }))
              }
            />
            <Editable
              label="Data avaliação"
              value={novaCobertura.dataAvaliacao}
              type="date"
              onChange={(value) =>
                setNovaCobertura((c) => ({
                  ...c,
                  dataAvaliacao: value,
                }))
              }
            />
          </div>
          <div className="filters-actions">
            <button className="btn primary" type="button" onClick={handleAddCobertura}>
              Adicionar cobertura ➕
            </button>
          </div>
          {coberturas.length > 0 && (
            <div className="table-wrapper" style={{ marginTop: '0.6rem' }}>
              <table className="table small">
                <thead>
                  <tr>
                    <th>% Palhada</th>
                    <th>Data avaliação</th>
                  </tr>
                </thead>
                <tbody>
                  {coberturas.map((c, idx) => (
                    <tr key={`${c.dataAvaliacao}-${idx}`}>
                      <td>{c.percentualPalhada}</td>
                      <td>{c.dataAvaliacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {step === 'historico' && (
        <section className="section">
          <h3 className="section-title">7 - Histórico produtivo</h3>
          <div className="two-column">
            <Editable
              label="Cultura anterior"
              value={novoHistorico.culturaAnterior}
              onChange={(value) =>
                setNovoHistorico((h) => ({
                  ...h,
                  culturaAnterior: value,
                }))
              }
            />
            <Editable
              label="Plantio"
              value={novoHistorico.plantio}
              type="date"
              onChange={(value) =>
                setNovoHistorico((h) => ({
                  ...h,
                  plantio: value,
                }))
              }
            />
            <Editable
              label="Colheita"
              value={novoHistorico.colheita}
              type="date"
              onChange={(value) =>
                setNovoHistorico((h) => ({
                  ...h,
                  colheita: value,
                }))
              }
            />
            <div className="field">
              <label>Integração Lavoura Pecuária</label>
              <select
                value={novoHistorico.ilp}
                onChange={(e) =>
                  setNovoHistorico((h) => ({
                    ...h,
                    ilp: e.target.value as ProductionHistory['ilp'],
                  }))
                }
              >
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>
          </div>
          <div className="filters-actions">
            <button className="btn primary" type="button" onClick={handleAddHistorico}>
              Adicionar produção ➕
            </button>
          </div>
          {historicos.length > 0 && (
            <div className="table-wrapper" style={{ marginTop: '0.6rem' }}>
              <table className="table small">
                <thead>
                  <tr>
                    <th>Cultura anterior</th>
                    <th>Plantio</th>
                    <th>Colheita</th>
                    <th>Integração Lavoura Pecuária</th>
                  </tr>
                </thead>
                <tbody>
                  {historicos.map((h, idx) => (
                    <tr key={`${h.culturaAnterior}-${h.plantio}-${idx}`}>
                      <td>{h.culturaAnterior}</td>
                      <td>{h.plantio}</td>
                      <td>{h.colheita}</td>
                      <td>{h.ilp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {step === 'revisao' && (
        <section className="section">
          <h3 className="section-title">8 - Revisão da solicitação</h3>
          <div className="two-column">
            <ReadOnly label="Produtor" value={producer.nome} />
            <ReadOnly label="CAR" value={property.car} />
            <ReadOnly label="Talhão" value={`${talhao.areaHa.toFixed(2)} ha`} />
          </div>

          <div className="validations-grid">
            <ValidationItem label="Produtor identificado" ok={validacoes.produtorIdentificado} />
            <ValidationItem label="CAR selecionado" ok={validacoes.carSelecionado} />
            <ValidationItem label="Talhão dentro do CAR" ok={validacoes.talhaoDentroCar} />
            <ValidationItem label="Cultura informada e validada" ok={validacoes.culturaValidada} />
            <ValidationItem label="Data de plantio informada" ok={validacoes.dataPlantioInformada} />
            <ValidationItem
              label="Análise de solo vinculada ao talhão"
              ok={validacoes.analiseSoloVinculada}
            />
            <ValidationItem label="Manejos cadastrados" ok={validacoes.manejosCadastrados} />
            <ValidationItem
              label="Cobertura do solo informada"
              ok={validacoes.coberturaSoloInformada}
            />
            <ValidationItem
              label="Histórico produtivo informado"
              ok={validacoes.historicoProdutivoInformado}
            />
            <ValidationItem
              label="Plantio em contorno informado"
              ok={validacoes.plantioContornoInformado}
            />
          </div>
        </section>
      )}

      <section className="section footer-nav">
        <button className="btn ghost" onClick={onCancel}>
          Cancelar ❌
        </button>
        <div className="footer-nav-right">
          <button className="btn secondary" onClick={goPrev} disabled={currentIndex === 0}>
            Voltar ⬅️
          </button>
          <button
            className="btn primary"
            onClick={goNext}
            disabled={currentIndex === stepsOrder.length - 1}
          >
            Próximo ➡️
          </button>
        </div>
      </section>
      {showProducerModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3 className="section-title" style={{ marginBottom: 0 }}>
                Buscar produtor
              </h3>
            </div>
            <div className="modal-body">
              <div className="two-column">
                <div className="field">
                  <label>Tipo de matrícula</label>
                  <select
                    value={producerTipoMatricula}
                    onChange={(e) => setProducerTipoMatricula(e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="Cooperado">Cooperado</option>
                    <option value="Não cooperado">Não cooperado</option>
                  </select>
                </div>
                <Editable
                  label="Matrícula"
                  value={producerMatricula}
                  onChange={setProducerMatricula}
                />
                <Editable label="CPF/CNPJ" value={producerCpfCnpj} onChange={setProducerCpfCnpj} />
                <Editable label="Nome do cooperado" value={producerNome} onChange={setProducerNome} />
              </div>
              <div className="table-wrapper" style={{ marginTop: '0.75rem' }}>
                <table className="table small">
                  <thead>
                    <tr>
                      <th>Matrícula</th>
                      <th>CPF/CNPJ</th>
                      <th>Nome</th>
                      <th>Tipo Matrícula</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducers.map((p) => (
                      <tr
                        key={`${p.cpfCnpj}-${p.matricula}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setProducer(p)
                          setProducerSelecionado(true)
                          setValidacoes((v) => ({
                            ...v,
                            produtorIdentificado: true,
                          }))
                          setShowProducerModal(false)
                        }}
                      >
                        <td>{p.matricula}</td>
                        <td>{p.cpfCnpj}</td>
                        <td>{p.nome}</td>
                        <td>{p.tipoMatricula}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn secondary"
                onClick={() => setShowProducerModal(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      {showPropertyModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3 className="section-title" style={{ marginBottom: 0 }}>
                Buscar propriedade
              </h3>
            </div>
            <div className="modal-body">
              <div className="two-column">
                <Editable label="CAR" value={propertyCar} onChange={setPropertyCar} />
                <Editable label="Nome da propriedade" value={propertyNome} onChange={setPropertyNome} />
                <Editable
                  label="Município"
                  value={propertyMunicipio}
                  onChange={setPropertyMunicipio}
                />
              </div>
              <div className="table-wrapper" style={{ marginTop: '0.75rem' }}>
                <table className="table small">
                  <thead>
                    <tr>
                      <th>CAR</th>
                      <th>Propriedade</th>
                      <th>Município</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProperties.map((p) => (
                      <tr
                        key={p.car}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setProperty(p)
                          setValidacoes((v) => ({
                            ...v,
                            carSelecionado: true,
                          }))
                          setShowPropertyModal(false)
                        }}
                      >
                        <td>{p.car}</td>
                        <td>{p.nome}</td>
                        <td>{p.municipio}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn secondary"
                onClick={() => setShowPropertyModal(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      {showProjetoModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3 className="section-title" style={{ marginBottom: 0 }}>
                Buscar projeto de custeio
              </h3>
            </div>
            <div className="modal-body">
              <div className="two-column">
                <Editable
                  label="Número do projeto"
                  value={projetoNumeroFiltro}
                  onChange={setProjetoNumeroFiltro}
                />
              </div>
              <div className="table-wrapper" style={{ marginTop: '0.75rem' }}>
                <table className="table small">
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Safra</th>
                      <th>Tipo matrícula</th>
                      <th>Matrícula</th>
                      <th>Produtor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjetos.map((p, idx) => (
                      <tr
                        key={`${p.numero}-${idx}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setTalhao((t) => ({
                            ...t,
                            projetoCusteio: p.numero,
                            safra: p.safra,
                          }))
                          setShowProjetoModal(false)
                        }}
                      >
                        <td>{p.numero}</td>
                        <td>{p.safra}</td>
                        <td>{p.produtor.tipoMatricula}</td>
                        <td>{p.produtor.matricula}</td>
                        <td>{p.produtor.nome}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn secondary"
                onClick={() => setShowProjetoModal(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ProgressBarProps {
  steps: Step[]
  currentStep: Step
}

function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  return (
    <div className="wizard-progress">
      {steps.map((s) => (
        <div
          key={s}
          className={`wizard-step ${steps.indexOf(s) <= steps.indexOf(currentStep) ? 'active' : ''}`}
        >
          <span className="wizard-step-label">{labelForStep(s)}</span>
        </div>
      ))}
    </div>
  )
}

function labelForStep(step: Step): string {
  switch (step) {
    case 'produtor':
      return 'Produtor'
    case 'propriedade':
      return 'Propriedade/Talhão'
    case 'analise':
      return 'Análise de solo'
    case 'manejo':
      return 'Manejo'
    case 'cobertura':
      return 'Cobertura'
    case 'historico':
      return 'Produções'
    case 'revisao':
      return 'Revisão'
  }
}

interface ReadOnlyProps {
  label: string
  value: string
}

function ReadOnly({ label, value }: ReadOnlyProps) {
  return (
    <div className="field-readonly">
      <span className="field-label">{label}</span>
      <span className="field-value">{value}</span>
    </div>
  )
}

interface EditableProps {
  label: string
  value: string
  type?: 'text' | 'date'
  onChange: (value: string) => void
  onBlur?: () => void
}

function Editable({ label, value, type = 'text', onChange, onBlur }: EditableProps) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
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

function calculatePolygonAreaHa(coords: [number, number][]): number {
  if (!coords || coords.length < 3) return 0

  const R = 6371000 // raio da Terra em metros
  const lats = coords.map((c) => (c[0] * Math.PI) / 180)
  const lngs = coords.map((c) => (c[1] * Math.PI) / 180)
  const lat0 = lats.reduce((a, b) => a + b, 0) / lats.length

  const projected = coords.map(([latDeg, lngDeg]) => {
    const lat = (latDeg * Math.PI) / 180
    const lng = (lngDeg * Math.PI) / 180
    const x = R * (lng - lngs[0]) * Math.cos(lat0)
    const y = R * (lat - lats[0])
    return { x, y }
  })

  let area = 0
  for (let i = 0; i < projected.length; i++) {
    const j = (i + 1) % projected.length
    area += projected[i].x * projected[j].y - projected[j].x * projected[i].y
  }
  area = Math.abs(area) / 2 // m²
  const hectares = area / 10_000
  return parseFloat(hectares.toFixed(2))
}

