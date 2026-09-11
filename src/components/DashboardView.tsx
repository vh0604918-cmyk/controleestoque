import React from 'react';
import { Material, Department, InventoryStats } from '../types.ts';
import {
  DollarSign,
  PackageCheck,
  AlertTriangle,
  RotateCw,
  ArrowDownRight,
  ArrowUpRight,
  PlusCircle,
  FilePlus,
  AlertCircle,
  TrendingUp,
  Boxes
} from 'lucide-react';

interface DashboardViewProps {
  stats: InventoryStats | null;
  materials: Material[];
  departments: Department[];
  onSelectView: (view: string) => void;
  onOpenQuickEntry: (materialId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  materials,
  departments,
  onSelectView,
  onOpenQuickEntry
}) => {
  // Itens em estado crítico (quantidade <= mínima)
  const criticalMaterials = materials.filter(m => m.currentQuantity <= m.minQuantity);

  // Formatação de Moeda BRL
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  // Cálculo de estoque agrupado por setor
  const departmentStockMap = departments.map(dept => {
    const deptMaterials = materials.filter(m => m.departmentId === dept.id);
    const totalItems = deptMaterials.reduce((acc, m) => acc + m.currentQuantity, 0);
    const totalValue = deptMaterials.reduce((acc, m) => acc + (m.currentQuantity * m.averageUnitCost), 0);
    return {
      department: dept,
      itemCount: deptMaterials.length,
      totalUnits: totalItems,
      totalValue
    };
  }).sort((a, b) => b.totalValue - a.totalValue);

  const totalInvValue = stats?.totalInventoryValue || 1;

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Visão */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-blue-900/40 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-amber-400 rounded-xs inline-block"></span>
            Painel de Indicadores de Estoque
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visão consolidada da posição financeira, giro operacional e alertas críticos de suprimentos.
          </p>
        </div>

        {/* Ações Rápidas */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-quick-entry"
            onClick={() => onOpenQuickEntry()}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <ArrowDownRight className="w-4 h-4 text-emerald-200" />
            <span>Nova Entrada</span>
          </button>

          <button
            id="btn-quick-exit"
            onClick={() => onSelectView('movements-out')}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <ArrowUpRight className="w-4 h-4 text-blue-200" />
            <span>Nova Saída</span>
          </button>

          <button
            id="btn-quick-requisition"
            onClick={() => onSelectView('requisitions-new')}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-colors"
          >
            <FilePlus className="w-4 h-4" />
            <span>Criar Requisição</span>
          </button>
        </div>
      </div>

      {/* Grid de KPIs Obrigatórios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Valor Total do Estoque */}
        <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Valor Total do Estoque
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight">
              {formatCurrency(stats?.totalInventoryValue || 0)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400 inline" />
              Calculado por Custo Médio Ponderado
            </p>
          </div>
        </div>

        {/* KPI 2: Taxa de Rotatividade / Giro de Estoque */}
        <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Taxa de Rotatividade
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <RotateCw className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-400 tracking-tight">
              {stats?.stockTurnoverRate ? `${stats.stockTurnoverRate}x` : '1.42x'}
              <span className="text-xs font-medium text-slate-400 ml-1.5">/ano</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Giro anualizado baseado no consumo mensal
            </p>
          </div>
        </div>

        {/* KPI 3: Alerta Visual para Itens Críticos */}
        <div
          onClick={() => onSelectView('reports-critical')}
          className={`border rounded-xl p-5 shadow-lg cursor-pointer transition-all duration-200 ${
            (stats?.criticalItemsCount || 0) > 0
              ? 'bg-gradient-to-br from-[#1C1A27] to-[#25151C] border-amber-500/60 hover:border-amber-400'
              : 'bg-[#0D1B36] border-blue-900/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Itens em Nível Crítico
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">
                {stats?.criticalItemsCount || 0}
                <span className="text-xs font-medium text-slate-300 ml-1.5">
                  {(stats?.criticalItemsCount || 0) === 1 ? 'material' : 'materiais'}
                </span>
              </div>
              <p className="text-[11px] text-amber-400 mt-1 font-medium">
                {stats?.outOfStockCount || 0} com estoque zerado
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-400 underline">
              Ver lista →
            </span>
          </div>
        </div>

        {/* KPI 4: Materiais Cadastrados */}
        <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Catálogo de Materiais
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight">
              {stats?.totalMaterialsCount || materials.length}
              <span className="text-xs font-medium text-slate-400 ml-1.5">itens</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Distribuídos em {departments.length} setores ativos
            </p>
          </div>
        </div>
      </div>

      {/* Seção 2: Alertas Críticos de Reposição */}
      {criticalMaterials.length > 0 && (
        <div className="bg-[#101F3D] border border-amber-500/40 rounded-xl p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Atenção Operacional: Materiais em Falta ou Abaixo do Mínimo
                </h2>
                <p className="text-xs text-slate-400">
                  Estes itens atingiram o Ponto de Pedido (ROP) e necessitam de emissão de compra ou entrada imediata.
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectView('reports-critical')}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              Relatório Completo de Reposição &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/70 uppercase text-[10px] font-bold text-slate-400 border-b border-blue-900/40">
                <tr>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Material</th>
                  <th className="py-2.5 px-3">Localização</th>
                  <th className="py-2.5 px-3 text-right">Mínimo</th>
                  <th className="py-2.5 px-3 text-right">Saldo Atual</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Ação Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/30">
                {criticalMaterials.map(mat => {
                  const isOutOfStock = mat.currentQuantity === 0;
                  return (
                    <tr key={mat.id} className="hover:bg-blue-950/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-amber-300 font-semibold">{mat.code}</td>
                      <td className="py-2.5 px-3 font-medium text-white">{mat.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{mat.location || 'Almoxarifado'}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{mat.minQuantity} {mat.unit}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                        {mat.currentQuantity} {mat.unit}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isOutOfStock
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {isOutOfStock ? 'Em Falta (0)' : 'Abaixo do Mín.'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onOpenQuickEntry(mat.id)}
                          className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded text-[11px] transition-colors"
                        >
                          Repor Estoque
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Seção 3: Dois Blocos - Materiais Mais Movimentados & Estoque por Setor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bloco 1: Materiais Mais Movimentados */}
        <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-amber-400" />
                Materiais Mais Movimentados
              </h2>
              <p className="text-xs text-slate-400">
                Itens com maior demanda e fluxo de saída e entrada
              </p>
            </div>
            <button
              onClick={() => onSelectView('movements')}
              className="text-xs text-amber-400 hover:underline font-medium"
            >
              Ver Todas &rarr;
            </button>
          </div>

          <div className="space-y-3.5">
            {stats?.topMovedMaterials && stats.topMovedMaterials.length > 0 ? (
              stats.topMovedMaterials.map((item, idx) => {
                const total = item.totalExits + item.totalEntries;
                const maxVal = stats.topMovedMaterials[0]
                  ? stats.topMovedMaterials[0].totalExits + stats.topMovedMaterials[0].totalEntries
                  : 1;
                const percent = Math.min(100, Math.round((total / (maxVal || 1)) * 100));

                return (
                  <div key={item.materialId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200 truncate max-w-[240px]">
                        <span className="font-mono text-amber-400 mr-1.5">{item.materialCode}</span>
                        {item.materialName}
                      </span>
                      <div className="text-right text-[11px] font-mono">
                        <span className="text-red-400 font-semibold">{item.totalExits} saídas</span>
                        <span className="text-slate-500 mx-1">•</span>
                        <span className="text-emerald-400 font-semibold">{item.totalEntries} entradas</span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                        title={`${total} ${item.unit} movimentados`}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">Nenhuma movimentação registrada até o momento.</p>
            )}
          </div>
        </div>

        {/* Bloco 2: Posição Financeira por Setor / Departamento */}
        <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Boxes className="w-4 h-4 text-blue-400" />
                Estoque Vinculado por Setor
              </h2>
              <p className="text-xs text-slate-400">
                Distribuição do valor financeiro imobilizado por centro de custo
              </p>
            </div>
            <button
              onClick={() => onSelectView('departments')}
              className="text-xs text-amber-400 hover:underline font-medium"
            >
              Ver Setores &rarr;
            </button>
          </div>

          <div className="space-y-3.5">
            {departmentStockMap.map(item => {
              const percent = totalInvValue > 0 ? Math.round((item.totalValue / totalInvValue) * 100) : 0;

              return (
                <div key={item.department.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">
                      {item.department.name}
                      <span className="text-slate-400 text-[11px] ml-1.5">
                        ({item.itemCount} tipos de material)
                      </span>
                    </span>
                    <span className="font-mono font-bold text-amber-300">
                      {formatCurrency(item.totalValue)}
                      <span className="text-slate-400 font-normal text-[10px] ml-1">({percent}%)</span>
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
