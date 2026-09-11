import React, { useState } from 'react';
import { Department, Material } from '../types.ts';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Package,
  User,
  Mail,
  Phone,
  Layers,
  Search,
  ExternalLink
} from 'lucide-react';

interface DepartmentsViewProps {
  departments: Department[];
  materials: Material[];
  onSaveDepartment: (data: Partial<Department>) => Promise<void>;
  onDeleteDepartment: (id: string) => Promise<void>;
  onFilterMaterialsByDept: (deptId: string) => void;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  departments,
  materials,
  onSaveDepartment,
  onDeleteDepartment,
  onFilterMaterialsByDept
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [selectedDeptForDetails, setSelectedDeptForDetails] = useState<Department | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [manager, setManager] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  const openAddModal = () => {
    setEditingDept(null);
    setCode(`SET-${Math.floor(10 + Math.random() * 90)}`);
    setName('');
    setManager('');
    setEmail('');
    setPhone('');
    setDescription('');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setCode(dept.code);
    setName(dept.name);
    setManager(dept.manager);
    setEmail(dept.email);
    setPhone(dept.phone || '');
    setDescription(dept.description || '');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !manager.trim()) {
      setErrorMsg('Código, Nome do setor e Responsável são obrigatórios.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onSaveDepartment({
        ...(editingDept ? { id: editingDept.id } : {}),
        code: code.trim().toUpperCase(),
        name: name.trim(),
        manager: manager.trim(),
        email: email.trim(),
        phone: phone.trim(),
        description: description.trim()
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar setor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, deptName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o setor "${deptName}"?`)) {
      try {
        await onDeleteDepartment(id);
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir setor.');
      }
    }
  };

  const filteredDepts = departments.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-blue-900/40 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-amber-400 rounded-xs inline-block"></span>
            Gestão de Setores & Departamentos
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cadastro de centros de custos, gestores responsáveis e associação de catálogo de materiais.
          </p>
        </div>

        <button
          id="btn-add-department"
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Setor</span>
        </button>
      </div>

      {/* Busca */}
      <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-4 shadow-md flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do setor, código ou responsável..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-blue-900/60 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
      </div>

      {/* Grid de Cards dos Setores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDepts.map((dept) => {
          const deptMaterials = materials.filter(m => m.departmentId === dept.id);
          const totalStockUnits = deptMaterials.reduce((acc, m) => acc + m.currentQuantity, 0);
          const totalStockValue = deptMaterials.reduce((acc, m) => acc + (m.currentQuantity * m.averageUnitCost), 0);
          const criticalItemsInDept = deptMaterials.filter(m => m.currentQuantity <= m.minQuantity).length;

          return (
            <div
              key={dept.id}
              className="bg-[#0D1B36] border border-blue-900/50 hover:border-amber-500/40 rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all duration-200"
            >
              <div>
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white tracking-tight">{dept.name}</h2>
                      <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                        {dept.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(dept)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                      title="Editar Setor"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id, dept.name)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors"
                      title="Excluir Setor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                  {dept.description || 'Sem descrição cadastrada.'}
                </p>

                {/* Dados de Contato e Responsável */}
                <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-lg border border-blue-900/30 text-xs mb-4">
                  <div className="flex items-center text-slate-300 gap-2">
                    <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-medium truncate">{dept.manager}</span>
                  </div>
                  {dept.email && (
                    <div className="flex items-center text-slate-400 gap-2 text-[11px]">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{dept.email}</span>
                    </div>
                  )}
                  {dept.phone && (
                    <div className="flex items-center text-slate-400 gap-2 text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{dept.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Estatísticas de Materiais do Setor */}
              <div>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-blue-900/40 text-center text-xs">
                  <div className="bg-slate-900/40 p-2 rounded">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Materiais</div>
                    <div className="font-bold text-white font-mono text-sm">{deptMaterials.length} itens</div>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Valor Total</div>
                    <div className="font-bold text-amber-300 font-mono text-xs">{formatCurrency(totalStockValue)}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  {criticalItemsInDept > 0 ? (
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      {criticalItemsInDept} item(ns) em nível crítico
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-400">Estoque regular</span>
                  )}

                  <button
                    onClick={() => onFilterMaterialsByDept(dept.id)}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
                  >
                    <span>Ver Materiais</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Cadastro / Edição de Setor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-[#0B132B] border border-blue-900/60 rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between border-b border-blue-900/40 pb-3 mb-4">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {editingDept ? 'Editar Setor / Departamento' : 'Cadastrar Novo Setor'}
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
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Código *
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    placeholder="Ex: SET-TI"
                    className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs font-mono text-amber-300 uppercase focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Nome do Setor / Departamento *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Ex: Tecnologia da Informação"
                    className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Gestor Responsável *
                </label>
                <input
                  type="text"
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  required
                  placeholder="Nome completo do responsável pelo setor"
                  className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    E-mail Corporativo
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="setor@empresa.com.br"
                    className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Telefone / Ramal
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 3450-4000"
                    className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Descrição e Atividades do Setor
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Finalidade operacional do setor na empresa..."
                  className="w-full px-3 py-2 bg-slate-900 border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
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
                  {isSubmitting ? 'Salvando...' : editingDept ? 'Atualizar Setor' : 'Salvar Setor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
