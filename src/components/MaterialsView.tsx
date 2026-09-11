import React, { useState } from 'react';
import { Material, Department, UnitOfMeasure } from '../types.ts';
import { ConfirmModal } from './ConfirmModal.tsx';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  MapPin,
  ArrowDownRight,
  ArrowUpRight,
  Filter
} from 'lucide-react';

interface MaterialsViewProps {
  materials: Material[];
  departments: Department[];
  onSaveMaterial: (materialData: Partial<Material>) => Promise<void>;
  onDeleteMaterial: (id: string) => Promise<void>;
  onOpenMovement: (type: 'IN' | 'OUT', materialId: string) => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials,
  departments,
  onSaveMaterial,
  onDeleteMaterial,
  onOpenMovement
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<{ id: string; name: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState<UnitOfMeasure>('UN');
  const [minQuantity, setMinQuantity] = useState<number>(5);
  const [currentQuantity, setCurrentQuantity] = useState<number>(0);
  const [averageUnitCost, setAverageUnitCost] = useState<number>(0);
  const [departmentId, setDepartmentId] = useState('');
  const [category, setCategory] = useState('Geral');
  const [location, setLocation] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  const openAddModal = () => {
    setEditingMaterial(null);
    setCode(`MAT-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setDescription('');
    setUnit('UN');
    setMinQuantity(5);
    setCurrentQuantity(0);
    setAverageUnitCost(0);
    setDepartmentId(departments[0]?.id || '');
    setCategory('Almoxarifado');
    setLocation('');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (mat: Material) => {
    setEditingMaterial(mat);
    setCode(mat.code);
    setName(mat.name);
    setDescription(mat.description || '');
    setUnit(mat.unit);
    setMinQuantity(mat.minQuantity);
    setCurrentQuantity(mat.currentQuantity);
    setAverageUnitCost(mat.averageUnitCost);
    setDepartmentId(mat.departmentId || '');
    setCategory(mat.category || 'Geral');
    setLocation(mat.location || '');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setErrorMsg('Código e Nome do material são obrigatórios.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onSaveMaterial({
        ...(editingMaterial ? { id: editingMaterial.id } : {}),
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description.trim(),
        unit,
        minQuantity: Number(minQuantity) || 0,
        currentQuantity: editingMaterial ? editingMaterial.currentQuantity : Number(currentQuantity) || 0,
        averageUnitCost: Number(averageUnitCost) || 0,
        departmentId,
        category: category.trim() || 'Geral',
        location: location.trim()
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar material.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string, matName: string) => {
    setMaterialToDelete({ id, name: matName });
  };

  const handleConfirmDelete = async () => {
    if (!materialToDelete) return;
    try {
      await onDeleteMaterial(materialToDelete.id);
      setActionFeedback({
        type: 'success',
        text: `Material "${materialToDelete.name}" excluído com sucesso.`
      });
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        text: err.message || 'Erro ao excluir material.'
      });
      setTimeout(() => setActionFeedback(null), 5000);
    } finally {
      setMaterialToDelete(null);
    }
  };

  // Filtragem dos materiais
  const filteredMaterials = materials.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || m.departmentId === selectedDept;

    let matchesStatus = true;
    if (selectedStatus === 'OUT') {
      matchesStatus = m.currentQuantity === 0;
    } else if (selectedStatus === 'LOW') {
      matchesStatus = m.currentQuantity > 0 && m.currentQuantity <= m.minQuantity;
    } else if (selectedStatus === 'NORMAL') {
      matchesStatus = m.currentQuantity > m.minQuantity;
    }

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-blue-900/40 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-amber-400 rounded-xs inline-block"></span>
            Gestão do Catálogo de Materiais
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cadastro completo, níveis mínimos de segurança, custo médio e controle de estoque físico.
          </p>
        </div>

        <button
          id="btn-add-material"
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Material</span>
        </button>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-4 shadow-md flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-materials"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome, código (ex: MAT-101) ou categoria..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-blue-900/60 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filtro de Setor */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              id="select-filter-dept"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 bg-slate-900/80 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
            >
              <option value="ALL">Todos os Setores</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Filtro de Status de Estoque */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              id="select-filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-900/80 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
            >
              <option value="ALL">Todos os Status</option>
              <option value="NORMAL">Estoque Normal</option>
              <option value="LOW">Abaixo do Mínimo</option>
              <option value="OUT">Em Falta (Zerado)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Materiais */}
      <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#091224] uppercase text-[10px] font-bold text-slate-400 border-b border-blue-900/50">
              <tr>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Material & Descrição</th>
                <th className="py-3 px-4">Setor Associado</th>
                <th className="py-3 px-4">Localização</th>
                <th className="py-3 px-4 text-center">Unidade</th>
                <th className="py-3 px-4 text-right">Mínimo</th>
                <th className="py-3 px-4 text-right">Saldo Físico</th>
                <th className="py-3 px-4 text-right">Custo Médio</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/30">
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((mat) => {
                  const dept = departments.find(d => d.id === mat.departmentId);
                  const isOutOfStock = mat.currentQuantity === 0;
                  const isBelowMin = mat.currentQuantity <= mat.minQuantity;
                  const totalValue = mat.currentQuantity * mat.averageUnitCost;

                  return (
                    <tr key={mat.id} className="hover:bg-blue-950/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                        {mat.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{mat.name}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                          {mat.description || 'Sem descrição cadastrada.'}
                        </div>
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[9px] bg-slate-800 text-slate-300 rounded">
                          {mat.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {dept ? (
                          <div>
                            <span className="font-medium text-slate-200">{dept.name}</span>
                            <div className="text-[10px] text-slate-400 font-mono">{dept.code}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Não vinculado</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{mat.location || 'Geral'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold">
                        <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px]">
                          {mat.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {mat.minQuantity}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span
                          className={`text-sm ${
                            isOutOfStock
                              ? 'text-red-400'
                              : isBelowMin
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {mat.currentQuantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {formatCurrency(mat.averageUnitCost)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-300">
                        {formatCurrency(totalValue)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                            <XCircle className="w-3 h-3" /> Falta
                          </span>
                        ) : isBelowMin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <AlertTriangle className="w-3 h-3" /> Crítico
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-3 h-3" /> Normal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Atalho Entrada */}
                          <button
                            onClick={() => onOpenMovement('IN', mat.id)}
                            className="p-1.5 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 transition-colors"
                            title="Registrar Entrada"
                          >
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Atalho Saída */}
                          <button
                            onClick={() => onOpenMovement('OUT', mat.id)}
                            disabled={mat.currentQuantity <= 0}
                            className="p-1.5 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Registrar Saída"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Editar */}
                          <button
                            onClick={() => openEditModal(mat)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                            title="Editar Material"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Excluir */}
                          <button
                            onClick={() => handleDeleteClick(mat.id, mat.name)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors"
                            title="Excluir Material"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    Nenhum material encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-[#0B132B] border border-blue-900/60 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between border-b border-blue-900/40 pb-3 mb-4">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {editingMaterial ? 'Editar Material' : 'Cadastrar Novo Material'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Código do Material *
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    placeholder="Ex: MAT-101"
                    className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs font-mono text-amber-300 uppercase focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Nome do Material *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Ex: Luva Nitrílica de Proteção"
                    className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Descrição Técnica Detalhada
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Especificações, dimensões, normas técnicas..."
                  className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Unidade de Medida *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as UnitOfMeasure)}
                    className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="UN">UN - Unidade</option>
                    <option value="CX">CX - Caixa</option>
                    <option value="M">M - Metro</option>
                    <option value="KG">KG - Quilograma</option>
                    <option value="L">L - Litro</option>
                    <option value="PC">PC - Peça</option>
                    <option value="RL">RL - Rolo</option>
                    <option value="PAR">PAR - Par</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Estoque Mínimo (Alerta) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Custo Médio Unitário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={averageUnitCost}
                    onChange={(e) => setAverageUnitCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {!editingMaterial && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Saldo Inicial Físico (Inventário Inicial)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={currentQuantity}
                    onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-400">
                    Posteriores alterações de saldo devem ser feitas via registro de Entrada/Saída para histórico de auditoria.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Setor Principal Associado
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="">Selecione um setor...</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: EPI, Elétrica, Redes"
                    className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Localização no Almoxarifado
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Prateleira B-02"
                    className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-900/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : editingMaterial ? 'Atualizar Material' : 'Salvar Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Feedback de Ação */}
      {actionFeedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
              : 'bg-red-950/80 border-red-700 text-red-300'
          }`}
        >
          <span>{actionFeedback.text}</span>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={!!materialToDelete}
        title="Excluir Material"
        message={`Tem certeza que deseja excluir o material "${materialToDelete?.name}"? Se este material possuir histórico de movimentações, a integridade do banco bloqueará a exclusão.`}
        confirmLabel="Sim, Excluir"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setMaterialToDelete(null)}
      />
    </div>
  );
};
