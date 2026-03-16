/**
 * Gera planilha Excel (zarc_dados_teste.xlsx) com as tabelas do modelo ZARC
 * e dados de teste baseados no mock do front-end.
 * Uso: node scripts/generate-zarc-excel.mjs
 */

import XLSX from 'xlsx'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outPath = join(root, 'docs', 'zarc_dados_teste.xlsx')

// --- Dados de teste (espelhando mock + schema) ---

const produtor = [
  ['id_produtor', 'cpf_cnpj', 'nome', 'tipo_produtor', 'tipo_matricula', 'matricula'],
  [1, '123.456.789-00', 'João da Silva', 'Proprietario', 'Cooperado', '45892'],
  [2, '987.654.321-00', 'Maria Souza', 'Proprietario', 'Cooperado', '12345'],
  [3, '55.222.333/0001-10', 'Agrovale LTDA', 'Proprietario', 'NaoCooperado', 'NC-7788'],
  [4, '321.654.987-00', 'Pedro Almeida', 'Arrendatario', 'Cooperado', '88990'],
  [5, '11.222.333/0001-44', 'Fazendas União', 'Proprietario', 'Cooperado', '55667'],
]

const propriedade = [
  ['id_propriedade', 'id_produtor', 'car', 'nome', 'municipio', 'codigo_ibge'],
  [1, 1, 'PR-4123456', 'Fazenda Boa Vista', 'Campo Mourão', '4104303'],
  [2, 2, 'PR-67890', 'Sítio Esperança', 'Mamborê', '4109401'],
  [3, 3, 'PR-445566', 'Fazenda Horizonte Azul', 'Peabiru', '4118805'],
  [4, 4, 'PR-998877', 'Sítio São José', 'Eng. Beltrão', '4107504'],
  [5, 5, 'PR-554433', 'Fazenda União', 'Campo Mourão', '4104303'],
]

const talhao = [
  ['id_talhao', 'id_propriedade', 'nome', 'area_ha', 'cultura', 'data_plantio', 'safra', 'projeto_custeio', 'plantio_em_contorno'],
  [1, 1, 'Talhão 1', 12.45, 'Soja', '2024-10-15', '2024/2025', '23456', true],
  [2, 2, 'Talhão 2', 18.9, 'Milho', '2023-11-05', '2023/2024', '98765', false],
  [3, 3, 'Talhão 3', 25.3, 'Trigo', '2025-06-12', '2025', '44551', true],
  [4, 4, 'Talhão 4', 9.8, 'Soja 2ª safra', '2025-01-05', '2024/2025', '77889', false],
  [5, 5, 'Talhão 5', 30.2, 'Milho safrinha', '2025-02-20', '2024/2025', '99001', true],
]

const projeto_custeio = [
  ['id_projeto', 'numero_projeto', 'safra', 'id_produtor', 'tipo_matricula', 'matricula', 'nome_produtor'],
  [1, '23456', '2024/2025', 1, 'Cooperado', '45892', 'João da Silva'],
  [2, '98765', '2023/2024', 2, 'Cooperado', '12345', 'Maria Souza'],
  [3, '44551', '2025', 3, 'NaoCooperado', 'NC-7788', 'Agrovale LTDA'],
  [4, '77889', '2024/2025', 4, 'Cooperado', '88990', 'Pedro Almeida'],
  [5, '99001', '2024/2025', 5, 'Cooperado', '55667', 'Fazendas União'],
]

const talhao_projeto_custeio = [
  ['id_talhao_projeto', 'id_talhao', 'id_projeto'],
  [1, 1, 1],
  [2, 2, 2],
  [3, 3, 3],
  [4, 4, 4],
  [5, 5, 5],
]

const solicitacao_zarc = [
  ['id_solicitacao', 'codigo_externo', 'id_talhao', 'id_projeto', 'status', 'data_solicitacao', 'agronomo_responsavel', 'produtor_identificado', 'car_selecionado', 'talhao_dentro_car', 'cultura_validada', 'data_plantio_informada', 'analise_solo_vinculada', 'manejos_cadastrados', 'cobertura_solo_informada', 'historico_produtivo_informado', 'plantio_contorno_informado'],
  [1, '000123', 1, 1, 'EM_ELABORACAO', '2026-03-10', 'Roberto Bueno', true, true, true, true, true, true, true, true, true, true],
  [2, '000124', 2, 2, 'ENVIADA', '2026-02-18', 'Fabrício Costa', true, true, true, true, true, true, true, true, true, true],
  [3, '000125', 3, 3, 'EM_REVISAO', '2026-03-05', 'Ana Paula Lima', true, true, true, true, true, false, false, false, false, true],
  [4, '000126', 4, 4, 'RET_SUCESSO', '2026-01-20', 'Carlos Menezes', true, true, true, true, true, true, true, true, true, true],
  [5, '000127', 5, 5, 'RET_ERRO', '2026-03-01', 'Luciana Prado', true, true, false, true, true, false, false, false, false, true],
]

const analise_solo = [
  ['id_analise', 'id_talhao', 'data_coleta', 'camada', 'argila', 'p', 'k', 'ca', 'mg', 'lat', 'lng'],
  [1, 1, '2024-02-12', '0-20', '35%', '12', '110', '4.2', '1.8', -24.043, -52.38],
  [2, 1, '2024-02-10', '20-40', '32%', '10', '90', '3.8', '1.6', -24.044, -52.379],
]

const solicitacao_analise_solo = [
  ['id_solicitacao', 'id_analise'],
  [1, 1],
  [1, 2],
]

const manejo = [
  ['id_manejo', 'id_solicitacao', 'operacao', 'tipo', 'data'],
  [1, 1, 'Plantio', 'Plantio direto', '2024-10-15'],
  [2, 1, 'Adubação', 'Cobertura', '2024-11-05'],
]

const cobertura_solo = [
  ['id_cobertura', 'id_solicitacao', 'percentual_palhada', 'data_avaliacao'],
  [1, 1, 60, '2024-11-20'],
]

const historico_producao = [
  ['id_historico', 'id_solicitacao', 'cultura_anterior', 'data_plantio', 'data_colheita', 'ilp'],
  [1, 1, 'Milho', '2023-02-10', '2023-06-20', 'Nao'],
]

const resultado_zarc = [
  ['id_resultado', 'id_solicitacao', 'status_analise', 'classificacao_risco', 'janela_plantio', 'indice_aptidao', 'recomendacao_tecnica'],
  [1, 1, 'Concluida', 'Baixo risco', '15/10 até 10/11', 82, 'Área apta para cultivo da cultura informada dentro da janela climática recomendada.'],
  [2, 4, 'Concluida', 'Médio risco', '05/01 até 25/01', 71, 'Área apta com atenção a períodos de maior déficit hídrico.'],
  [3, 5, 'Concluida', 'Alto risco', '20/02 até 05/03', 48, 'Recomenda-se reavaliar época de plantio e cultivar.'],
]

const integracao_zarc = [
  ['id_integracao', 'id_solicitacao', 'ambiente_envio', 'versao_layout', 'datahora_prevista_envio', 'usuario_responsavel_envio', 'status_integracao', 'protocolo', 'mensagem_retorno', 'datahora_envio_efetivo'],
  [1, 1, 'Producao', 'v1.0', '2026-03-11 14:35:00', 'Roberto Bueno', 'SUCESSO', 'ZARC-2026-000987', 'Solicitação recebida com sucesso pelo serviço ZARC.', '2026-03-11 14:36:00'],
  [2, 2, 'Producao', 'v1.0', '2026-02-18 10:00:00', 'Fabrício Costa', null, null, null, null],
  [3, 3, 'Homologacao', 'v1.0', '2026-03-06 09:00:00', 'Ana Paula Lima', null, null, null, null],
  [4, 4, 'Producao', 'v1.0', '2026-01-20 09:00:00', 'Carlos Menezes', 'SUCESSO', 'ZARC-2026-000654', 'Processado com sucesso.', '2026-01-20 09:01:30'],
  [5, 5, 'Producao', 'v1.0', '2026-03-02 16:00:00', 'Luciana Prado', 'ERRO', 'ZARC-2026-000777', 'Erro de validação nos dados de talhão.', '2026-03-02 16:01:10'],
]

// --- Montar workbook e gravar ---

const sheets = [
  ['produtor', produtor],
  ['propriedade', propriedade],
  ['talhao', talhao],
  ['projeto_custeio', projeto_custeio],
  ['talhao_projeto_custeio', talhao_projeto_custeio],
  ['solicitacao_zarc', solicitacao_zarc],
  ['analise_solo', analise_solo],
  ['solicitacao_analise_solo', solicitacao_analise_solo],
  ['manejo', manejo],
  ['cobertura_solo', cobertura_solo],
  ['historico_producao', historico_producao],
  ['resultado_zarc', resultado_zarc],
  ['integracao_zarc', integracao_zarc],
]

const wb = XLSX.utils.book_new()

for (const [name, data] of sheets) {
  const ws = XLSX.utils.aoa_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, name)
}

XLSX.writeFile(wb, outPath)
console.log('Planilha gerada:', outPath)
