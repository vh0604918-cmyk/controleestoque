import React, { useState } from 'react';
import { Requisition, Material, Department, RequisitionPriority, RequisitionItem } from '../types.ts';
import {
  FileText,
  Plus,
  Printer,
  CheckCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Trash2,
  Package,
  Calendar,
  UserCheck
} from 'lucide-react';
import { PrintRequisitionModal } from './PrintRequisitionModal.tsx';

interface RequisitionsViewProps {
  requisitions: Requisition[];
  materials: Material[];
  departments: Department[];
  onCreateRequisition: (data: Partial<Requisition>) => Promise<void>;
  onUpdateStatus: (id: string, status: Requisition['status'], authorizedBy?: string) => Promise<void>;
  onFulfillRequisition: (id: string) => Promise<void>;
  userName?: string;
}

export const RequisitionsView: React.FC<RequisitionsViewProps> = ({
  requisitions,
  materials,
  departments,
  onCreateRequisition,
  onUpdateStatus,
  onFulfillRequisition,
  userName = 'Almoxarife'
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [printRequisition, setPrintRequisition] = useState<Requisition | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [deptId, setDeptId] = useState(departments[0]?.id || '');
  const [requesterName, setRequesterName] = useState(userName);
  const [priority, setPriority] = useState<RequisitionPriority>('MEDIA');
  const [reason, setReason] = useState('');
  const [observations, setObservations] = useState('');
  const [items, setItems] = useState<RequisitionItem[]>([
    {
      materialId: materials[0]?.id || '',
      materialCode: materials[0]?.code || '',
      materialName: materials[0]?.name || '',
      unit: materials[0]?.unit || 'UN',
      quantityRequested: 1,
      unitCost: materials[0]?.averageUnitCost || 0
    }
  ]);

  const formatCurrency = (val?: number) => {
    if (!val) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  const addItemRow = () => {
    if (materials.length === 0) return;
    const defaultMat = materials[0];
    setItems(prev => [
      ...prev,
      {
        materialId: defaultMat.id,
        materialCode: defaultMat.code,
        materialName: defaultMat.name,
        unit: defaultMat.unit,
        quantityRequested: 1,
        unitCost: defaultMat.averageUnitCost
      }
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateItemRow = (index: number, matId: string, quantity: number) => {
    const mat = materials.find(m => m.id === matId);
    if (!mat) return;

    setItems(prev => {
      const copy = [...prev];
      copy[index] = {
        materialId: mat.id,
        materialCode: mat.code,
        materialName: mat.name,
        unit: mat.unit,
        quantityRequested: Math.max(1, quantity),
        unitCost: mat.averageUnitCost
      };
      return copy;
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!deptId || !requesterName.trim() || items.length === 0) {
      setErrorMsg('Setor, requisitante e itens são obrigatórios.');
      return;
    }

    const dept = departments.find(d => d.id === deptId);

    try {
      setIsSubmitting(true);
      await onCreateRequisition({
        departmentId: deptId,
        departmentName: dept?.name || 'Setor Solicitante',
        requesterName: requesterName.trim(),
        priority,
        reason: reason.trim() || 'Consumo operacional',
        status: 'PENDENTE',
        date: new Date().toISOString().split('T')[0],
        items,
        observations: observations.trim()
      });

      setIsNewModalOpen(false);
      // Reset
      setReason('');
      setObservations('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao criar requisição.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (req: Requisition) => {
    try {
      await onUpdateStatus(req.id, 'APROVADA', userName);
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar requisição.');
    }
  };

  const handleFulfill = async (req: Requisition) => {
    if (window.confirm(`Deseja atender a requisição ${req.code}? Isso baixará automaticamente os materiais do estoque.`)) {
      try {
        await onFulfillRequisition(req.id);
      } catch (err: any) {
        alert(err.message || 'Erro ao atender requisição.');
      }
    }
  };

  const handleCancel = async (req: Requisition) => {
    if (window.confirm(`Tem certeza que deseja cancelar a requisição ${req.code}?`)) {
      try {
        await onUpdateStatus(req.id, 'CANCELADA', userName);
      } catch (err: any) {
        alert(err.message || 'Erro ao cancelar requisição.');
      }
    }
  };

  const filteredRequisitions = requisitions.filter(r => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-blue-900/40 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-amber-400 rounded-xs inline-block"></span>
            Requisições de Materiais & Atendimento
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de pedidos formais de setores, autorização de entrega e emissão de requisição em formato imprimível (PDF).
          </p>
        </div>

        <button
          id="btn-new-requisition"
          onClick={() => {
            setErrorMsg(null);
            setIsNewModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Requisição</span>
        </button>
      </div>

      {/* Filtros por Status */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filterStatus === 'ALL'
              ? 'bg-amber-400 text-slate-950'
              : 'bg-[#0D1B36] border border-blue-900/50 text-slate-300 hover:bg-slate-800'
          }`}
        >
          Todas ({requisitions.length})
        </button>
        <button
          onClick={() => setFilterStatus('PENDENTE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filterStatus === 'PENDENTE'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-[#0D1B36] border border-blue-900/50 text-slate-300 hover:bg-slate-800'
          }`}
        >
          Pendentes ({requisitions.filter(r => r.status === 'PENDENTE').length})
        </button>
        <button
          onClick={() => setFilterStatus('APROVADA')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filterStatus === 'APROVADA'
              ? 'bg-blue-500 text-white'
              : 'bg-[#0D1B36] border border-blue-900/50 text-slate-300 hover:bg-slate-800'
          }`}
        >
          Aprovadas ({requisitions.filter(r => r.status === 'APROVADA').length})
        </button>
        <button
          onClick={() => setFilterStatus('ATENDIDA')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filterStatus === 'ATENDIDA'
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-[#0D1B36] border border-blue-900/50 text-slate-300 hover:bg-slate-800'
          }`}
        >
          Atendidas ({requisitions.filter(r => r.status === 'ATENDIDA').length})
        </button>
      </div>

      {/* Lista de Requisições */}
      <div className="space-y-4">
        {filteredRequisitions.length > 0 ? (
          filteredRequisitions.map((req) => {
            const totalItemsCount = req.items.reduce((acc, i) => acc + i.quantityRequested, 0);
            const totalEstimatedCost = req.items.reduce((acc, i) => acc + (i.quantityRequested * (i.unitCost || 0)), 0);

            return (
              <div
                key={req.id}
                className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-5 shadow-lg space-y-4 hover:border-amber-500/30 transition-all"
              >
                {/* Topo do Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-900/40 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400 text-base">{req.code}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            req.status === 'ATENDIDA'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : req.status === 'APROVADA'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : req.status === 'CANCELADA'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {req.status}
                        </span>

                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                            req.priority === 'URGENTE'
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : req.priority === 'ALTA'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {req.priority}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-white">{req.departmentName}</span>
                        <span className="text-slate-500">•</span>
                        <span>Solicitante: <strong className="text-slate-200">{req.requesterName}</strong></span>
                        <span className="text-slate-500">•</span>
                        <span className="font-mono text-slate-400">{req.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ações da Requisição */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {/* Botão Oficial de Emissão / Imprimir PDF */}
                    <button
                      onClick={() => setPrintRequisition(req)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-lg text-xs transition-colors border border-amber-400/30"
                      title="Emitir Requisição Oficial para Impressão / PDF"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Emitir PDF / Imprimir</span>
                    </button>

                    {req.status === 'PENDENTE' && (
                      <button
                        onClick={() => handleApprove(req)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Aprovar</span>
                      </button>
                    )}

                    {(req.status === 'PENDENTE' || req.status === 'APROVADA') && (
                      <button
                        onClick={() => handleFulfill(req)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Atender (Baixar Estoque)</span>
                      </button>
                    )}

                    {req.status !== 'ATENDIDA' && req.status !== 'CANCELADA' && (
                      <button
                        onClick={() => handleCancel(req)}
                        className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                        title="Cancelar Requisição"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Justificativa */}
                <p className="text-xs text-slate-300">
                  <strong className="text-slate-400">Justificativa:</strong> {req.reason}
                </p>

                {/* Tabela de Itens Requisitados */}
                <div className="overflow-x-auto bg-slate-900/60 rounded-lg p-3 border border-blue-900/30">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="uppercase text-[9px] font-bold text-slate-400 border-b border-blue-900/40">
                      <tr>
                        <th className="py-1 px-2">Código</th>
                        <th className="py-1 px-2">Material</th>
                        <th className="py-1 px-2 text-center">Unidade</th>
                        <th className="py-1 px-2 text-right">Qtd. Requisitada</th>
                        <th className="py-1 px-2 text-right">Custo Est. (R$)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-900/20">
                      {req.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-1.5 px-2 font-mono text-amber-300 font-semibold">{item.materialCode}</td>
                          <td className="py-1.5 px-2 font-medium text-white">{item.materialName}</td>
                          <td className="py-1.5 px-2 text-center font-mono">{item.unit}</td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold text-white">
                            {item.quantityRequested}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono text-amber-300">
                            {formatCurrency((item.quantityRequested) * (item.unitCost || 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-blue-900/40 font-bold">
                        <td colSpan={3} className="py-1.5 px-2 text-right text-[11px] text-slate-400 uppercase">
                          Total:
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono text-white">
                          {totalItemsCount} unid.
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono text-amber-400 font-bold">
                          {formatCurrency(totalEstimatedCost)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-8 text-center text-slate-400">
            Nenhuma requisição encontrada para o filtro selecionado.
          </div>
        )}
      </div>

      {/* Modal de Nova Requisição Multi-Itens */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-[#0B132B] border border-blue-900/60 rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between border-b border-blue-900/40 pb-3 mb-4">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Criar Nova Requisição de Materiais
              </h2>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Setor Solicitante *
                  </label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Nome do Solicitante *
                  </label>
                  <input
                    type="text"
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    required
                    placeholder="Seu nome"
                    className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Prioridade da Requisição
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as RequisitionPriority)}
                    className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="BAIXA">Baixa</option>
                    <option value="MEDIA">Média</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Justificativa / Finalidade *
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  placeholder="Ex: Instalação da nova linha de montagem, manutenção corretiva do ar condicionado..."
                  className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Tabela de Itens Selecionáveis */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Itens Requisitados
                  </label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Outro Item</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {items.map((item, index) => {
                    const currentMat = materials.find(m => m.id === item.materialId);
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-slate-900/70 border border-blue-900/40 rounded-lg text-xs"
                      >
                        <div className="flex-1">
                          <select
                            value={item.materialId}
                            onChange={(e) => updateItemRow(index, e.target.value, item.quantityRequested)}
                            className="w-full px-2 py-1.5 bg-slate-950 border border-blue-900/60 rounded text-xs text-white focus:outline-none focus:border-amber-400"
                          >
                            {materials.map(m => (
                              <option key={m.id} value={m.id}>
                                {m.code} - {m.name} (Saldo: {m.currentQuantity} {m.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-24">
                          <input
                            type="number"
                            min={1}
                            value={item.quantityRequested}
                            onChange={(e) => updateItemRow(index, item.materialId, Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-slate-950 border border-blue-900/60 rounded text-xs font-mono font-bold text-center text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <span className="w-12 text-center font-mono text-slate-400 text-xs font-bold">
                          {item.unit}
                        </span>

                        <div className="w-24 text-right font-mono text-amber-300 text-xs">
                          {formatCurrency((item.quantityRequested) * (item.unitCost || 0))}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          disabled={items.length <= 1}
                          className="p-1 text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Remover Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Observações Gerais
                </label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={2}
                  placeholder="Prazo estimado de retirada, local de entrega..."
                  className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-900/40">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Gravando Requisição...' : 'Emitir Requisição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Impressão / Emissão Oficial em PDF */}
      <PrintRequisitionModal
        requisition={printRequisition}
        onClose={() => setPrintRequisition(null)}
      />
    </div>
  );
};
