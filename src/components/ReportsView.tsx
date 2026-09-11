import React, { useState } from 'react';
import { Material, Department, Movement } from '../types.ts';
import {
  BarChart3,
  Printer,
  Download,
  AlertTriangle,
  Package,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';

interface ReportsViewProps {
  materials: Material[];
  departments: Department[];
  movements: Movement[];
  initialSubTab?: 'position' | 'period' | 'critical';
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  materials,
  departments,
  movements,
  initialSubTab = 'position'
}) => {
  const [activeReport, setActiveReport] = useState<'position' | 'period' | 'critical'>(initialSubTab);

  // Filtros Relatório 1: Posição Atual
  const [filterDeptPosition, setFilterDeptPosition] = useState('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'quantity'>('value');

  // Filtros Relatório 2: Período
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [periodType, setPeriodType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  // Processamento: Posição Atual
  const positionMaterials = materials
    .filter(m => filterDeptPosition === 'ALL' || m.departmentId === filterDeptPosition)
    .sort((a, b) => {
      if (sortBy === 'value') {
        return (b.currentQuantity * b.averageUnitCost) - (a.currentQuantity * a.averageUnitCost);
      }
      if (sortBy === 'quantity') {
        return b.currentQuantity - a.currentQuantity;
      }
      return a.name.localeCompare(b.name);
    });

  const totalPositionValue = positionMaterials.reduce((acc, m) => acc + (m.currentQuantity * m.averageUnitCost), 0);
  const totalPositionUnits = positionMaterials.reduce((acc, m) => acc + m.currentQuantity, 0);

  // Processamento: Movimentações por Período
  const periodMovements = movements.filter(m => {
    const matchesDate = (!startDate || m.date >= startDate) && (!endDate || m.date <= endDate);
    const matchesType = periodType === 'ALL' || m.type === periodType;
    return matchesDate && matchesType;
  });

  const periodEntriesCost = periodMovements
    .filter(m => m.type === 'IN')
    .reduce((acc, m) => acc + (m.totalCost || (m.unitCost ? m.unitCost * m.quantity : 0)), 0);

  const periodExitsCost = periodMovements
    .filter(m => m.type === 'OUT')
    .reduce((acc, m) => acc + (m.totalCost || (m.unitCost ? m.unitCost * m.quantity : 0)), 0);

  // Processamento: Materiais Críticos e em Falta
  const criticalMaterials = materials.filter(m => m.currentQuantity <= m.minQuantity);
  const outOfStockMaterials = criticalMaterials.filter(m => m.currentQuantity === 0);
  const belowMinMaterials = criticalMaterials.filter(m => m.currentQuantity > 0);

  // Exportar CSV
  const exportPositionCSV = () => {
    const headers = ['Código', 'Material', 'Categoria', 'Setor', 'Localização', 'Unidade', 'Estoque Mínimo', 'Saldo Atual', 'Custo Médio (R$)', 'Valor Total (R$)', 'Status'];
    const rows = positionMaterials.map(m => {
      const dept = departments.find(d => d.id === m.departmentId);
      const isOut = m.currentQuantity === 0;
      const isLow = m.currentQuantity <= m.minQuantity;
      const status = isOut ? 'EM FALTA' : isLow ? 'ABAIXO DO MÍNIMO' : 'NORMAL';
      return [
        m.code,
        `"${m.name.replace(/"/g, '""')}"`,
        `"${m.category || ''}"`,
        `"${dept?.name || ''}"`,
        `"${m.location || ''}"`,
        m.unit,
        m.minQuantity,
        m.currentQuantity,
        m.averageUnitCost.toFixed(2),
        (m.currentQuantity * m.averageUnitCost).toFixed(2),
        status
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `relatorio-posicao-estoque-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCriticalCSV = () => {
    const headers = ['Código', 'Material', 'Setor', 'Unidade', 'Estoque Mínimo', 'Saldo Físico', 'Déficit (Necessidade Reposição)', 'Custo Unit. Estimado', 'Custo Total Reposição'];
    const rows = criticalMaterials.map(m => {
      const dept = departments.find(d => d.id === m.departmentId);
      const deficit = Math.max(0, m.minQuantity - m.currentQuantity);
      return [
        m.code,
        `"${m.name.replace(/"/g, '""')}"`,
        `"${dept?.name || ''}"`,
        m.unit,
        m.minQuantity,
        m.currentQuantity,
        deficit,
        m.averageUnitCost.toFixed(2),
        (deficit * m.averageUnitCost).toFixed(2)
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `relatorio-itens-criticos-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-blue-900/40 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-amber-400 rounded-xs inline-block"></span>
            Relatórios Gerenciais de Estoque
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Posição atual de saldos, fluxo financeiro por período e diagnóstico de materiais críticos.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {/* Seletor de Tipo de Relatório */}
      <div className="no-print flex flex-wrap gap-2">
        <button
          onClick={() => setActiveReport('position')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeReport === 'position'
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
              : 'bg-[#0D1B36] border border-blue-900/50 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Posição Atual do Estoque</span>
        </button>

        <button
          onClick={() => setActiveReport('period')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeReport === 'period'
              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
              : 'bg-[#0D1B36] border border-blue-900/50 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Movimentações por Período</span>
        </button>

        <button
          onClick={() => setActiveReport('critical')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeReport === 'critical'
              ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
              : 'bg-[#0D1B36] border border-blue-900/50 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Itens Críticos & Em Falta ({criticalMaterials.length})</span>
        </button>
      </div>

      {/* ========================================================
          RELATÓRIO 1: POSIÇÃO ATUAL DO ESTOQUE
          ======================================================== */}
      {activeReport === 'position' && (
        <div className="space-y-4">
          {/* Filtros da Posição */}
          <div className="no-print bg-[#0D1B36] border border-blue-900/50 rounded-xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold">Setor:</span>
                <select
                  value={filterDeptPosition}
                  onChange={(e) => setFilterDeptPosition(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">Todos os Setores</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="value">Maior Valor Financeiro</option>
                  <option value="quantity">Maior Quantidade</option>
                  <option value="name">Nome do Material (A-Z)</option>
                </select>
              </div>
            </div>

            <button
              onClick={exportPositionCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-lg text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Dados (CSV)</span>
            </button>
          </div>

          {/* Cabeçalho Oficial do Relatório para Impressão */}
          <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-6 shadow-lg print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
            <div className="border-b border-blue-900/50 pb-4 mb-4 print:border-black">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-white print:text-black">
                    Relatório Oficial de Posição Atual de Estoque
                  </h2>
                  <p className="text-xs text-slate-400 print:text-slate-600">
                    Posição consolidada dos saldos físicos e valoração contábil pelo método do Custo Médio Ponderado.
                  </p>
                </div>
                <div className="text-right text-xs text-slate-400 print:text-slate-700">
                  <div>Data de emissão: <strong>{new Date().toLocaleDateString('pt-BR')}</strong></div>
                  <div>Hora: <strong>{new Date().toLocaleTimeString('pt-BR')}</strong></div>
                </div>
              </div>

              {/* Totalizadores no topo */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-blue-900/30 print:border-slate-300">
                <div className="bg-slate-900/50 p-2.5 rounded border border-blue-900/30 print:bg-slate-100 print:border-slate-300">
                  <div className="text-[10px] uppercase text-slate-400 font-bold">Total de Itens</div>
                  <div className="text-base font-black text-white print:text-black font-mono">{positionMaterials.length} tipos</div>
                </div>
                <div className="bg-slate-900/50 p-2.5 rounded border border-blue-900/30 print:bg-slate-100 print:border-slate-300">
                  <div className="text-[10px] uppercase text-slate-400 font-bold">Volume Total Físico</div>
                  <div className="text-base font-black text-white print:text-black font-mono">{totalPositionUnits} unidades</div>
                </div>
                <div className="bg-slate-900/50 p-2.5 rounded border border-blue-900/30 print:bg-slate-100 print:border-slate-300">
                  <div className="text-[10px] uppercase text-slate-400 font-bold">Valor Total do Saldo</div>
                  <div className="text-base font-black text-amber-400 print:text-black font-mono">{formatCurrency(totalPositionValue)}</div>
                </div>
                <div className="bg-slate-900/50 p-2.5 rounded border border-blue-900/30 print:bg-slate-100 print:border-slate-300">
                  <div className="text-[10px] uppercase text-slate-400 font-bold">Itens em Alerta</div>
                  <div className="text-base font-black text-red-400 print:text-black font-mono">
                    {positionMaterials.filter(m => m.currentQuantity <= m.minQuantity).length} itens
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela do Relatório */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 print:text-black">
                <thead className="bg-[#091224] print:bg-slate-200 uppercase text-[10px] font-bold text-slate-400 print:text-slate-800 border-b border-blue-900/50 print:border-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Material</th>
                    <th className="py-2.5 px-3">Setor Associado</th>
                    <th className="py-2.5 px-3">Localização</th>
                    <th className="py-2.5 px-3 text-center">Unid.</th>
                    <th className="py-2.5 px-3 text-right">Mínimo</th>
                    <th className="py-2.5 px-3 text-right">Saldo Físico</th>
                    <th className="py-2.5 px-3 text-right">Custo Médio</th>
                    <th className="py-2.5 px-3 text-right">Valor Total</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900/30 print:divide-slate-300">
                  {positionMaterials.map((mat) => {
                    const dept = departments.find(d => d.id === mat.departmentId);
                    const isOut = mat.currentQuantity === 0;
                    const isLow = mat.currentQuantity <= mat.minQuantity;
                    const matTotal = mat.currentQuantity * mat.averageUnitCost;

                    return (
                      <tr key={mat.id} className="hover:bg-blue-950/40 transition-colors print:hover:bg-transparent">
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-300 print:text-black">{mat.code}</td>
                        <td className="py-2.5 px-3 font-medium text-white print:text-black">{mat.name}</td>
                        <td className="py-2.5 px-3 text-slate-400 print:text-slate-700">{dept?.name || 'Geral'}</td>
                        <td className="py-2.5 px-3 text-slate-400 print:text-slate-700">{mat.location || 'Almoxarifado'}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{mat.unit}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{mat.minQuantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-white print:text-black">
                          {mat.currentQuantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-300 print:text-black">
                          {formatCurrency(mat.averageUnitCost)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400 print:text-black">
                          {formatCurrency(matTotal)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {isOut ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 print:border-black print:text-black">
                              Falta
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 print:border-black print:text-black">
                              Crítico
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 print:border-black print:text-black">
                              Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-blue-900/50 print:border-black font-bold bg-[#091224] print:bg-slate-200">
                    <td colSpan={6} className="py-2.5 px-3 text-right uppercase text-xs">Total Geral:</td>
                    <td className="py-2.5 px-3 text-right font-mono text-white print:text-black text-sm">{totalPositionUnits}</td>
                    <td></td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-300 print:text-black text-sm">{formatCurrency(totalPositionValue)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-8 pt-4 border-t border-blue-900/30 print:border-slate-400 flex items-center justify-between text-[11px] text-slate-400 print:text-slate-600">
              <span>Responsável Técnico do Sistema: <strong>Victor Hugo</strong></span>
              <span>Assinatura do Responsável pelo Almoxarifado: _________________________________________</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          RELATÓRIO 2: MOVIMENTAÇÕES POR PERÍODO
          ======================================================== */}
      {activeReport === 'period' && (
        <div className="space-y-4">
          {/* Filtro de Período */}
          <div className="no-print bg-[#0D1B36] border border-blue-900/50 rounded-xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="font-semibold text-slate-400">De:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1.5 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="font-semibold text-slate-400">Até:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2 py-1.5 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="font-semibold text-slate-400">Tipo:</span>
                <select
                  value={periodType}
                  onChange={(e) => setPeriodType(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">Entradas e Saídas</option>
                  <option value="IN">Apenas Entradas</option>
                  <option value="OUT">Apenas Saídas</option>
                </select>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-lg text-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Relatório</span>
            </button>
          </div>

          <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-6 shadow-lg print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
            <div className="border-b border-blue-900/50 pb-4 mb-4 print:border-black">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-white print:text-black">
                    Relatório de Movimentações de Estoque por Período
                  </h2>
                  <p className="text-xs text-slate-400 print:text-slate-600">
                    Período selecionado: de <strong>{startDate || 'Início'}</strong> até <strong>{endDate || 'Hoje'}</strong>
                  </p>
                </div>
                <div className="text-right text-xs text-slate-400 print:text-slate-700">
                  <div>Registros listados: <strong>{periodMovements.length}</strong></div>
                </div>
              </div>

              {/* Balanço Financeiro do Período */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-3 border-t border-blue-900/30 print:border-slate-300">
                <div className="bg-slate-900/50 p-3 rounded border border-blue-900/30 print:bg-slate-100 print:border-slate-300">
                  <div className="text-[10px] uppercase text-emerald-400 font-bold flex items-center gap-1">
                    <ArrowDownRight className="w-3.5 h-3.5" /> Total Entradas (Compras/Recebimentos)
                  </div>
                  <div className="text-lg font-black text-white print:text-black font-mono mt-1">
                    {formatCurrency(periodEntriesCost)}
                  </div>
                </div>

                <div className="bg-slate-900/50 p-3 rounded border border-blue-900/30 print:bg-slate-100 print:border-slate-300">
                  <div className="text-[10px] uppercase text-blue-400 font-bold flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" /> Total Saídas (Consumo dos Setores)
                  </div>
                  <div className="text-lg font-black text-white print:text-black font-mono mt-1">
                    {formatCurrency(periodExitsCost)}
                  </div>
                </div>

                <div className="bg-slate-900/50 p-3 rounded border border-blue-900/30 print:bg-slate-100 print:border-slate-300">
                  <div className="text-[10px] uppercase text-amber-400 font-bold">
                    Variação Líquida Financeira
                  </div>
                  <div className="text-lg font-black text-amber-300 print:text-black font-mono mt-1">
                    {formatCurrency(periodEntriesCost - periodExitsCost)}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 print:text-black">
                <thead className="bg-[#091224] print:bg-slate-200 uppercase text-[10px] font-bold text-slate-400 print:text-slate-800 border-b border-blue-900/50 print:border-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3 text-center">Tipo</th>
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Material</th>
                    <th className="py-2.5 px-3 text-right">Quantidade</th>
                    <th className="py-2.5 px-3 text-right">Custo Total</th>
                    <th className="py-2.5 px-3">Setor / Fornecedor</th>
                    <th className="py-2.5 px-3">NF / Motivo</th>
                    <th className="py-2.5 px-3">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900/30 print:divide-slate-300">
                  {periodMovements.map((mov) => {
                    const isEntry = mov.type === 'IN';
                    return (
                      <tr key={mov.id} className="hover:bg-blue-950/40 transition-colors print:hover:bg-transparent">
                        <td className="py-2.5 px-3 font-mono text-slate-400 print:text-slate-800">{mov.date}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isEntry ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 print:text-black' : 'bg-blue-500/20 text-blue-300 border border-blue-500/40 print:text-black'
                          }`}>
                            {isEntry ? 'Entrada' : 'Saída'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-amber-400 print:text-black">{mov.code}</td>
                        <td className="py-2.5 px-3 font-medium text-white print:text-black">
                          {mov.materialName}
                          <div className="text-[10px] font-mono text-slate-400 print:text-slate-600">{mov.materialCode}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-white print:text-black">
                          {mov.quantity} {mov.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-300 print:text-black">
                          {mov.totalCost ? formatCurrency(mov.totalCost) : (mov.unitCost ? formatCurrency(mov.unitCost * mov.quantity) : '-')}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 print:text-black">
                          {isEntry ? mov.supplier : mov.departmentName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 print:text-slate-700">
                          {isEntry ? mov.invoiceNumber : mov.reason}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 print:text-slate-700 text-[11px]">
                          {mov.registeredBy}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          RELATÓRIO 3: MATERIAIS CRÍTICOS & EM FALTA (ROP)
          ======================================================== */}
      {activeReport === 'critical' && (
        <div className="space-y-4">
          <div className="no-print bg-[#0D1B36] border border-blue-900/50 rounded-xl p-4 shadow-md flex justify-between items-center">
            <p className="text-xs text-slate-300">
              Itens que atingiram o limite de segurança e requerem emissão urgente de Ordem de Compra.
            </p>
            <button
              onClick={exportCriticalCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-lg text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Lista de Compra (CSV)</span>
            </button>
          </div>

          <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-6 shadow-lg print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
            <div className="border-b border-blue-900/50 pb-4 mb-4 print:border-black">
              <h2 className="text-lg font-bold text-white print:text-black flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400 print:text-black" />
                Diagnóstico de Materiais Críticos e Sugestão de Reposição
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                Cálculo do Ponto de Reposição (ROP) baseado no Estoque Mínimo configurado por material.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 print:text-black">
                <thead className="bg-[#091224] print:bg-slate-200 uppercase text-[10px] font-bold text-slate-400 print:text-slate-800 border-b border-blue-900/50 print:border-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Material</th>
                    <th className="py-2.5 px-3">Setor</th>
                    <th className="py-2.5 px-3 text-center">Unid.</th>
                    <th className="py-2.5 px-3 text-right">Estoque Mínimo</th>
                    <th className="py-2.5 px-3 text-right">Saldo Físico Atual</th>
                    <th className="py-2.5 px-3 text-right font-bold text-amber-300 print:text-black">Déficit (Comprar)</th>
                    <th className="py-2.5 px-3 text-right">Custo Unit. Estimado</th>
                    <th className="py-2.5 px-3 text-right">Investimento Necessário</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900/30 print:divide-slate-300">
                  {criticalMaterials.length > 0 ? (
                    criticalMaterials.map((mat) => {
                      const dept = departments.find(d => d.id === mat.departmentId);
                      const deficit = Math.max(0, (mat.minQuantity * 2) - mat.currentQuantity); // Repor até o dobro do mínimo como política padrão
                      const isOutOfStock = mat.currentQuantity === 0;
                      const investment = deficit * mat.averageUnitCost;

                      return (
                        <tr key={mat.id} className="hover:bg-blue-950/40 transition-colors print:hover:bg-transparent">
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-300 print:text-black">{mat.code}</td>
                          <td className="py-2.5 px-3 font-medium text-white print:text-black">{mat.name}</td>
                          <td className="py-2.5 px-3 text-slate-400 print:text-slate-700">{dept?.name || 'Geral'}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{mat.unit}</td>
                          <td className="py-2.5 px-3 text-right font-mono">{mat.minQuantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-red-400 print:text-black">
                            {mat.currentQuantity}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-amber-400 print:text-black text-sm">
                            +{deficit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-300 print:text-black">
                            {formatCurrency(mat.averageUnitCost)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-300 print:text-black">
                            {formatCurrency(investment)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {isOutOfStock ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 print:text-black">
                                ZERADO
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 print:text-black">
                                CRÍTICO
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-emerald-400 font-semibold">
                        Excelente! Nenhum material encontra-se em nível crítico ou em falta no momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
