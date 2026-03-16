export type ZarcStatus =
  | 'EM_ELABORACAO'
  | 'EM_REVISAO'
  | 'PRONTA_ENVIO'
  | 'ENVIADA'
  | 'RET_SUCESSO'
  | 'RET_ERRO'

export type ZarcScreen = 'dashboard' | 'detail' | 'wizard' | 'send'

export interface Producer {
  cpfCnpj: string
  nome: string
  tipoProdutor: 'Proprietário' | 'Arrendatário'
  tipoMatricula: string
  matricula: string
}

export interface Property {
  car: string
  nome: string
  municipio: string
  codigoIbge: string
  carPolygon?: [number, number][] // [lat, lng]
}

export interface SoilAnalysisPoint {
  dataColeta: string
  camada: string
  argila: string
  p: string
  k: string
  ca: string
  mg: string
  lat?: number
  lng?: number
}

export interface ManagementOperation {
  operacao: string
  tipo: string
  data: string
}

export interface SoilCover {
  percentualPalhada: number
  dataAvaliacao: string
}

export interface ProductionHistory {
  culturaAnterior: string
  plantio: string
  colheita: string
  ilp: 'Sim' | 'Não'
}

export interface ZarcResult {
  statusAnalise: 'Pendente' | 'Em análise' | 'Concluída'
  classificacaoRisco: string
  janelaPlantio: string
  indiceAptidao: number
  recomendacaoTecnica: string
}

export interface IntegrationInfo {
  ambienteEnvio: 'Homologação' | 'Produção'
  versaoLayout: string
  dataHoraPrevistaEnvio: string
  usuarioResponsavelEnvio: string
  statusIntegracao?: 'SUCESSO' | 'ERRO'
  protocolo?: string
  mensagemRetorno?: string
  dataHoraEnvioEfetivo?: string
}

export interface FieldValidations {
  produtorIdentificado: boolean
  carSelecionado: boolean
  talhaoDentroCar: boolean
  culturaValidada: boolean
  dataPlantioInformada: boolean
  analiseSoloVinculada: boolean
  manejosCadastrados: boolean
  coberturaSoloInformada: boolean
  historicoProdutivoInformado: boolean
  plantioContornoInformado: boolean
}

export interface TalhaoInfo {
  areaHa: number
  cultura: string
  dataPlantio: string
  safra: string
  projetoCusteio: string
  plantioEmContorno: boolean
  talhaoPolygon?: [number, number][]
}

export interface ZarcRequest {
  id: string
  status: ZarcStatus
  dataSolicitacao: string
  agronomoResponsavel: string
  produtor: Producer
  propriedade: Property
  talhao: TalhaoInfo
  analisesSolo: SoilAnalysisPoint[]
  manejos: ManagementOperation[]
  coberturas: SoilCover[]
  historicos: ProductionHistory[]
  resultadoAnalise?: ZarcResult
  integracao?: IntegrationInfo
  validacoes: FieldValidations
}

