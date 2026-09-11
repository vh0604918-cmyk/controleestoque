import React, { useState } from 'react';
import { Movement, Material, Department } from '../types.ts';
import {
  ArrowDownRight,
  ArrowUpRight,
  History,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Building2,
  Package,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface MovementsViewProps {
  movements: Movement[];
  materials: Material[];
  departments: Department[];
  defaultTab?: 'history' | 'in' | 'out';
  preSelectedMaterialId?: string;
  onRegisterMovement: (data: Partial<Movement>) => Promise<void>;
  userName?: string;
}

export const MovementsView: React.FC<MovementsViewProps> = ({
  movements,
  materials,
  departments,
  defaultTab = 'history',
  preSelectedMaterialId,
  onRegisterMovement,
  userName = 'Almoxarife'
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'in' | 'out'>(defaultTab);

  // Filtros do Histórico
  const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [filterMaterial, setFilterMaterial] = useState<string>('ALL');
  const [filterDept, setFilterDept] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form states - Entrada
  const [inMaterialId, setInMaterialId] = useState(preSelectedMaterialId || (materials[0]?.id || ''));
  const [inDate, setInDate] = useState(new Date().toISOString().split('T')[0]);
  const [inQuantity, setInQuantity] = useState<number>(1);
  const [inSupplier, setInSupplier] = useState('');
  const [inUnitCost, setInUnitCost] = useState<number>(0);
  const [inInvoice, setInInvoice] = useState('');
  const [inObservations, setInObservations] = useState('');

  // Form states - Saída
  const [outMaterialId, setOutMaterialId] = useState(preSelectedMaterialId || (materials[0]?.id || ''));
  const [outDate, setOutDate] = useState(new Date().toISOString().split('T')[0]);
  const [outQuantity, setOutQuantity] = useState<number>(1);
  const [outDeptId, setOutDeptId] = useState(departments[0]?.id || '');
  const [outReason, setOutReason] = useState('');
  const [outRequester, setOutRequester] = useState('');
  const [outObservations, setOutObservations] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Material selecionado na Entrada
  const selectedInMaterial = materials.find(m => m.id === inMaterialId);

  // Material selecionado na Saída
  const selectedOutMaterial = materials.find(m => m.id === outMaterialId);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  // Submissão de Entrada
  const handleInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!inMaterialId) {
      setFormError('Selecione um material.');
      return;
    }
    if (inQuantity <= 0) {
      setFormError('A quantidade de entrada deve ser maior que zero.');
      return;
    }
    if (!inSupplier.trim()) {
      setFormError('Informe o fornecedor do material.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onRegisterMovement({
        type: 'IN',
        materialId: inMaterialId,
        quantity: Number(inQuantity),
        date: inDate,
        supplier: inSupplier.trim(),
        unitCost: Number(inUnitCost) || (selectedInMaterial?.averageUnitCost || 0),
        totalCost: (Number(inUnitCost) || (selectedInMaterial?.averageUnitCost || 0)) * Number(inQuantity),
        invoiceNumber: inInvoice.trim(),
        observations: inObservations.trim(),
        registeredBy: userName
      });

      setFormSuccess(`Entrada de ${inQuantity} ${selectedInMaterial?.unit} registrada com sucesso!`);
      // Reset form
      setInQuantity(1);
      setInSupplier('');
      setInInvoice('');
      setInObservations('');
      setTimeout(() => setFormSuccess(null), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao registrar entrada.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submissão de Saída
  const handleOutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!outMaterialId) {
      setFormError('Selecione um material.');
      return;
    }
    if (outQuantity <= 0) {
      setFormError('A quantidade de saída deve ser maior que zero.');
      return;
    }
    if (!selectedOutMaterial || selectedOutMaterial.currentQuantity < outQuantity) {
      setFormError(
        `Saldo insuficiente em estoque! Saldo disponível: ${selectedOutMaterial?.currentQuantity || 0} ${selectedOutMaterial?.unit || 'UN'}`
      );
      return;
    }
    if (!outDeptId) {
      setFormError('Selecione o setor responsável/destino.');
      return;
    }
    if (!outReason.trim()) {
      setFormError('Informe o motivo da saída.');
      return;
    }
    if (!outRequester.trim()) {
      setFormError('Informe o nome do requisitante.');
      return;
    }

    const dept = departments.find(d => d.id === outDeptId);

    try {
      setIsSubmitting(true);
      await onRegisterMovement({
        type: 'OUT',
        materialId: outMaterialId,
        quantity: Number(outQuantity),
        date: outDate,
        departmentId: outDeptId,
        departmentName: dept?.name || 'Setor Solicitante',
        reason: outReason.trim(),
        requester: outRequester.trim(),
        observations: outObservations.trim(),
        registeredBy: userName
      });

      setFormSuccess(`Saída de ${outQuantity} ${selectedOutMaterial?.unit} registrada com sucesso!`);
      // Reset form
      setOutQuantity(1);
      setOutReason('');
      setOutRequester('');
      setOutObservations('');
      setTimeout(() => setFormSuccess(null), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao registrar saída.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtragem de movimentações
  const filteredMovements = movements.filter(m => {
    const matchesType = filterType === 'ALL' || m.type === filterType;
    const matchesMaterial = filterMaterial === 'ALL' || m.materialId === filterMaterial;
    const matchesDept = filterDept === 'ALL' || m.departmentId === filterDept;

    const matchesSearch =
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.supplier && m.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.requester && m.requester.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.reason && m.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.invoiceNumber && m.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && m.date >= startDate;
    }
    if (endDate) {
      matchesDate = matchesDate && m.date <= endDate;
    }

    return matchesType && matchesMaterial && matchesDept && matchesSearch && matchesDate;
  });

  // Exportação para CSV
  const handleExportCSV = () => {
    const headers = ['Código', 'Tipo', 'Data', 'Material', 'Cód. Material', 'Quantidade', 'Unidade', 'Custo Unitário', 'Custo Total', 'Fornecedor/Setor', 'NF/Motivo', 'Requisitante', 'Registrado Por'];
    const rows = filteredMovements.map(m => [
      m.code,
      m.type === 'IN' ? 'ENTRADA' : 'SAÍDA',
      m.date,
      `"${m.materialName.replace(/"/g, '""')}"`,
      m.materialCode,
      m.quantity,
      m.unit,
      m.unitCost ? m.unitCost.toFixed(2) : '',
      m.totalCost ? m.totalCost.toFixed(2) : '',
      `"${(m.type === 'IN' ? m.supplier : m.departmentName) || ''}"`,
      `"${(m.type === 'IN' ? m.invoiceNumber : m.reason) || ''}"`,
      `"${m.requester || ''}"`,
      `"${m.registeredBy || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `historico-movimentacoes-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-blue-900/40 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-amber-400 rounded-xs inline-block"></span>
            Movimentação de Estoque
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registro de entradas (compras/fornecedores), saídas (setores/requisições) e histórico de auditoria.
          </p>
        </div>

        {/* Abas de Navegação */}
        <div className="flex bg-[#0D1B36] p-1 rounded-xl border border-blue-900/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histórico ({movements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('in')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'in'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
            <span>Nova Entrada</span>
          </button>

          <button
            onClick={() => setActiveTab('out')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'out'
                ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-blue-300" />
            <span>Nova Saída</span>
          </button>
        </div>
      </div>

      {formSuccess && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-700 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          {formSuccess}
        </div>
      )}

      {formError && (
        <div className="p-3 bg-red-950/70 border border-red-700 text-red-300 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          {formError}
        </div>
      )}

      {/* ABA 1: HISTÓRICO DE MOVIMENTAÇÕES */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-4 shadow-md space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar por código, material, fornecedor, setor, motivo ou NF..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-blue-900/60 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {/* Tipo: Todas, Entradas, Saídas */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 bg-slate-900/80 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">Todas as Movimentações</option>
                  <option value="IN">Apenas Entradas</option>
                  <option value="OUT">Apenas Saídas</option>
                </select>

                {/* Filtro Material */}
                <select
                  value={filterMaterial}
                  onChange={(e) => setFilterMaterial(e.target.value)}
                  className="px-3 py-2 bg-slate-900/80 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 max-w-xs"
                >
                  <option value="ALL">Todos os Materiais</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.code} - {m.name}</option>
                  ))}
                </select>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-lg text-xs transition-colors"
                  title="Exportar dados filtrados para CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV</span>
                </button>
              </div>
            </div>

            {/* Período de Data */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-blue-900/30 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Período:
              </span>
              <div className="flex items-center gap-1.5">
                <label className="text-[11px]">De:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1 bg-slate-900 border border-blue-900/60 rounded text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-[11px]">Até:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2 py-1 bg-slate-900 border border-blue-900/60 rounded text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="text-[11px] text-amber-400 hover:underline ml-2"
                >
                  Limpar datas
                </button>
              )}
            </div>
          </div>

          {/* Tabela de Histórico */}
          <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#091224] uppercase text-[10px] font-bold text-slate-400 border-b border-blue-900/50">
                  <tr>
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4 text-center">Tipo</th>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Material</th>
                    <th className="py-3 px-4 text-right">Quantidade</th>
                    <th className="py-3 px-4 text-right">Custo Unitário</th>
                    <th className="py-3 px-4 text-right">Custo Total</th>
                    <th className="py-3 px-4">Origem / Destino</th>
                    <th className="py-3 px-4">NF / Motivo</th>
                    <th className="py-3 px-4">Registrado Por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900/30">
                  {filteredMovements.length > 0 ? (
                    filteredMovements.map((mov) => {
                      const isEntry = mov.type === 'IN';
                      return (
                        <tr key={mov.id} className="hover:bg-blue-950/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-amber-300 whitespace-nowrap">
                            {mov.code}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                isEntry
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              }`}
                            >
                              {isEntry ? (
                                <>
                                  <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                                  Entrada
                                </>
                              ) : (
                                <>
                                  <ArrowUpRight className="w-3 h-3 text-blue-300" />
                                  Saída
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400">
                            {mov.date}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{mov.materialName}</div>
                            <span className="font-mono text-[10px] text-amber-400">{mov.materialCode}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-sm text-white whitespace-nowrap">
                            {mov.quantity} <span className="text-[11px] text-slate-400 font-normal">{mov.unit}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-300 whitespace-nowrap">
                            {mov.unitCost ? formatCurrency(mov.unitCost) : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-amber-300 whitespace-nowrap">
                            {mov.totalCost ? formatCurrency(mov.totalCost) : (mov.unitCost ? formatCurrency(mov.unitCost * mov.quantity) : '-')}
                          </td>
                          <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                            {isEntry ? (
                              <div>
                                <span className="text-white font-medium">{mov.supplier || 'Fornecedor padrão'}</span>
                              </div>
                            ) : (
                              <div>
                                <span className="text-white font-medium">{mov.departmentName || 'Setor solicitante'}</span>
                                {mov.requester && (
                                  <div className="text-[10px] text-slate-400">Req: {mov.requester}</div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                            {isEntry ? (
                              <span>{mov.invoiceNumber || 'Compra direta'}</span>
                            ) : (
                              <span>{mov.reason || 'Consumo operacional'}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                            {mov.registeredBy}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">
                        Nenhuma movimentação localizada com os critérios informados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: REGISTRO DE ENTRADA */}
      {activeTab === 'in' && (
        <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-6 shadow-lg max-w-3xl mx-auto">
          <div className="flex items-center gap-2 border-b border-blue-900/40 pb-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Registrar Entrada de Materiais
              </h2>
              <p className="text-xs text-slate-400">
                Lançamento de suprimentos recebidos de fornecedores com atualização do Custo Médio Ponderado.
              </p>
            </div>
          </div>

          <form onSubmit={handleInSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Material a Receber *
                </label>
                <select
                  value={inMaterialId}
                  onChange={(e) => {
                    setInMaterialId(e.target.value);
                    const mat = materials.find(m => m.id === e.target.value);
                    if (mat && inUnitCost === 0) {
                      setInUnitCost(mat.averageUnitCost);
                    }
                  }}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.code} - {m.name} (Estoque: {m.currentQuantity} {m.unit})
                    </option>
                  ))}
                </select>
                {selectedInMaterial && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Saldo atual em estoque: <strong className="text-white">{selectedInMaterial.currentQuantity} {selectedInMaterial.unit}</strong> | Custo Médio Atual: <strong className="text-amber-400">{formatCurrency(selectedInMaterial.averageUnitCost)}</strong>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Data de Entrada *
                </label>
                <input
                  type="date"
                  value={inDate}
                  onChange={(e) => setInDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Quantidade Recebida *
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min={1}
                    value={inQuantity}
                    onChange={(e) => setInQuantity(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-l-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                  <span className="px-3 py-2 bg-slate-800 border-y border-r border-blue-900/60 rounded-r-lg text-xs text-slate-400 font-mono">
                    {selectedInMaterial?.unit || 'UN'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Custo Unitário da Nota (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0.01}
                  value={inUnitCost}
                  onChange={(e) => setInUnitCost(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Valor Total da Entrada
                </label>
                <div className="px-3 py-2 bg-slate-900/50 border border-blue-900/30 rounded-lg text-xs font-mono font-bold text-emerald-400">
                  {formatCurrency((inUnitCost || 0) * (inQuantity || 0))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Fornecedor *
                </label>
                <input
                  type="text"
                  value={inSupplier}
                  onChange={(e) => setInSupplier(e.target.value)}
                  required
                  placeholder="Ex: Comercial Elétrica & Ferramentas Ltda"
                  className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Número da Nota Fiscal (NF-e)
                </label>
                <input
                  type="text"
                  value={inInvoice}
                  onChange={(e) => setInInvoice(e.target.value)}
                  placeholder="Ex: NF-e 44921"
                  className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observações de Recebimento
              </label>
              <textarea
                value={inObservations}
                onChange={(e) => setInObservations(e.target.value)}
                rows={2}
                placeholder="Inspeção de qualidade, condições da embalagem, lote de fabricação..."
                className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-900/40">
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Voltar ao Histórico
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs shadow-md disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Gravando Entrada...' : 'Confirmar Registro de Entrada'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ABA 3: REGISTRO DE SAÍDA */}
      {activeTab === 'out' && (
        <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-6 shadow-lg max-w-3xl mx-auto">
          <div className="flex items-center gap-2 border-b border-blue-900/40 pb-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Registrar Saída de Materiais
              </h2>
              <p className="text-xs text-slate-400">
                Baixa de estoque por atendimento de setor, ordem de serviço ou consumo interno.
              </p>
            </div>
          </div>

          <form onSubmit={handleOutSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Material Solicitado *
                </label>
                <select
                  value={outMaterialId}
                  onChange={(e) => setOutMaterialId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.code} - {m.name} (Disponível: {m.currentQuantity} {m.unit})
                    </option>
                  ))}
                </select>

                {selectedOutMaterial && (
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      Saldo disponível: <strong className={selectedOutMaterial.currentQuantity > 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {selectedOutMaterial.currentQuantity} {selectedOutMaterial.unit}
                      </strong>
                    </span>
                    <span className="text-amber-400">
                      Custo Unit.: {formatCurrency(selectedOutMaterial.averageUnitCost)}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Data de Saída *
                </label>
                <input
                  type="date"
                  value={outDate}
                  onChange={(e) => setOutDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Quantidade a Retirar *
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min={1}
                    max={selectedOutMaterial?.currentQuantity || 1}
                    value={outQuantity}
                    onChange={(e) => setOutQuantity(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-l-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                  <span className="px-3 py-2 bg-slate-800 border-y border-r border-blue-900/60 rounded-r-lg text-xs text-slate-400 font-mono">
                    {selectedOutMaterial?.unit || 'UN'}
                  </span>
                </div>
                {selectedOutMaterial && outQuantity > selectedOutMaterial.currentQuantity && (
                  <p className="text-[10px] text-red-400 font-bold mt-1">
                    Atenção: Quantidade solicitada excede o saldo físico disponível!
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Setor Responsável / Destino *
                </label>
                <select
                  value={outDeptId}
                  onChange={(e) => setOutDeptId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code}) - Resp: {d.manager}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Requisitante / Colaborador *
                </label>
                <input
                  type="text"
                  value={outRequester}
                  onChange={(e) => setOutRequester(e.target.value)}
                  required
                  placeholder="Nome de quem retirou o material"
                  className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Motivo da Saída / Aplicação *
                </label>
                <input
                  type="text"
                  value={outReason}
                  onChange={(e) => setOutReason(e.target.value)}
                  required
                  placeholder="Ex: Manutenção preventiva da Prensa 03, Instalação de ponto..."
                  className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observações Adicionais
              </label>
              <textarea
                value={outObservations}
                onChange={(e) => setOutObservations(e.target.value)}
                rows={2}
                placeholder="Número de ordem de serviço, destino final..."
                className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-900/40">
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Voltar ao Histórico
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedOutMaterial || selectedOutMaterial.currentQuantity <= 0}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow-md disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Processando Saída...' : 'Confirmar Saída e Baixar Estoque'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
