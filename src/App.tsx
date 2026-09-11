import React, { useState, useEffect, useCallback } from 'react';
import { Material, Department, Movement, Requisition, InventoryStats, User } from './types.ts';
import { api } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { MaterialsView } from './components/MaterialsView.tsx';
import { DepartmentsView } from './components/DepartmentsView.tsx';
import { MovementsView } from './components/MovementsView.tsx';
import { RequisitionsView } from './components/RequisitionsView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { BestPracticesView } from './components/BestPracticesView.tsx';
import { BackupView } from './components/BackupView.tsx';
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  // Estados Globais de Dados
  const [materials, setMaterials] = useState<Material[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);

  // Estados de Controle de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preSelectedMaterialId, setPreSelectedMaterialId] = useState<string | undefined>(undefined);

  // Usuário Atual
  const [currentUser] = useState<User>({
    id: 'USR-01',
    name: 'Victor Hugo',
    email: 'vh0604918@gmail.com',
    role: 'Responsável Técnico & Gestor de Suprimentos',
    department: 'Almoxarifado Central'
  });

  // Carregar todos os dados do backend
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [mats, depts, movs, reqs, st] = await Promise.all([
        api.getMaterials(),
        api.getDepartments(),
        api.getMovements(),
        api.getRequisitions(),
        api.getStats()
      ]);

      setMaterials(mats);
      setDepartments(depts);
      setMovements(movs);
      setRequisitions(reqs);
      setStats(st);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message || 'Erro ao sincronizar dados com o servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Contadores para Badges do Menu
  const criticalMaterialsCount = materials.filter(m => m.currentQuantity <= m.minQuantity).length;
  const pendingRequisitionsCount = requisitions.filter(r => r.status === 'PENDENTE').length;

  // Handlers para Ações de Materiais
  const handleSaveMaterial = async (materialData: Partial<Material>) => {
    if (materialData.id) {
      await api.updateMaterial(materialData.id, materialData);
    } else {
      await api.createMaterial(materialData);
    }
    await loadAllData();
  };

  const handleDeleteMaterial = async (id: string) => {
    await api.deleteMaterial(id);
    await loadAllData();
  };

  // Handlers para Ações de Departamentos
  const handleSaveDepartment = async (deptData: Partial<Department>) => {
    if (deptData.id) {
      await api.updateDepartment(deptData.id, deptData);
    } else {
      await api.createDepartment(deptData);
    }
    await loadAllData();
  };

  const handleDeleteDepartment = async (id: string) => {
    await api.deleteDepartment(id);
    await loadAllData();
  };

  // Handlers para Movimentações
  const handleRegisterMovement = async (movementData: Partial<Movement>) => {
    await api.createMovement(movementData);
    await loadAllData();
  };

  // Handlers para Requisições
  const handleCreateRequisition = async (reqData: Partial<Requisition>) => {
    await api.createRequisition(reqData);
    await loadAllData();
  };

  const handleUpdateRequisitionStatus = async (id: string, status: Requisition['status'], authorizedBy?: string) => {
    await api.updateRequisitionStatus(id, status, authorizedBy);
    await loadAllData();
  };

  const handleFulfillRequisition = async (id: string) => {
    await api.fulfillRequisition(id, currentUser.name);
    await loadAllData();
  };

  // Atalhos Rápidos entre Telas
  const handleOpenQuickEntry = (materialId?: string) => {
    setPreSelectedMaterialId(materialId);
    setCurrentView('movements-in');
  };

  const handleFilterMaterialsByDept = (deptId: string) => {
    setCurrentView('materials');
  };

  return (
    <div className="min-h-screen bg-[#070F2B] text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-400 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        onLogout={() => {
          // Mantém sessão corporativa segura do Responsável Técnico
        }}
        criticalCount={criticalMaterialsCount}
        onSelectView={(v) => setCurrentView(v)}
        toggleMobileMenu={() => setSidebarMobileOpen(!sidebarMobileOpen)}
      />

      {/* Conteúdo Principal com Barra Lateral */}
      <div className="flex-1 flex overflow-hidden">
        {/* Barra Lateral de Navegação */}
        <Sidebar
          currentView={currentView}
          onSelectView={(view) => {
            setPreSelectedMaterialId(undefined);
            setCurrentView(view);
          }}
          isOpenMobile={sidebarMobileOpen}
          onCloseMobile={() => setSidebarMobileOpen(false)}
          criticalCount={criticalMaterialsCount}
          pendingReqCount={pendingRequisitionsCount}
        />

        {/* Área de Visualização Principal */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#091224]/70">
          <div className="max-w-7xl mx-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-950/80 border border-red-800 text-red-200 rounded-xl flex items-center justify-between text-xs shadow-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={loadAllData}
                  className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white font-bold rounded text-[11px]"
                >
                  Tentar Novamente
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-3 text-slate-400">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <p className="text-xs font-semibold">Carregando dados do estoque corporativo...</p>
              </div>
            ) : (
              <>
                {/* Rota 1: Dashboard / Indicadores */}
                {currentView === 'dashboard' && (
                  <DashboardView
                    stats={stats}
                    materials={materials}
                    departments={departments}
                    onSelectView={setCurrentView}
                    onOpenQuickEntry={handleOpenQuickEntry}
                  />
                )}

                {/* Rota 2: Gestão de Materiais */}
                {currentView === 'materials' && (
                  <MaterialsView
                    materials={materials}
                    departments={departments}
                    onSaveMaterial={handleSaveMaterial}
                    onDeleteMaterial={handleDeleteMaterial}
                    onOpenMovement={(type, matId) => {
                      setPreSelectedMaterialId(matId);
                      setCurrentView(type === 'IN' ? 'movements-in' : 'movements-out');
                    }}
                  />
                )}

                {/* Rota 3: Gestão de Setores */}
                {currentView === 'departments' && (
                  <DepartmentsView
                    departments={departments}
                    materials={materials}
                    onSaveDepartment={handleSaveDepartment}
                    onDeleteDepartment={handleDeleteDepartment}
                    onFilterMaterialsByDept={handleFilterMaterialsByDept}
                  />
                )}

                {/* Rota 4: Movimentações (Histórico, Entrada, Saída) */}
                {(currentView === 'movements' || currentView === 'movements-in' || currentView === 'movements-out') && (
                  <MovementsView
                    movements={movements}
                    materials={materials}
                    departments={departments}
                    defaultTab={
                      currentView === 'movements-in'
                        ? 'in'
                        : currentView === 'movements-out'
                        ? 'out'
                        : 'history'
                    }
                    preSelectedMaterialId={preSelectedMaterialId}
                    onRegisterMovement={handleRegisterMovement}
                    userName={currentUser.name}
                  />
                )}

                {/* Rota 5: Requisições de Materiais */}
                {(currentView === 'requisitions' || currentView === 'requisitions-new') && (
                  <RequisitionsView
                    requisitions={requisitions}
                    materials={materials}
                    departments={departments}
                    onCreateRequisition={handleCreateRequisition}
                    onUpdateStatus={handleUpdateRequisitionStatus}
                    onFulfillRequisition={handleFulfillRequisition}
                    userName={currentUser.name}
                  />
                )}

                {/* Rota 6: Relatórios Gerenciais */}
                {(currentView === 'reports' || currentView === 'reports-critical' || currentView === 'reports-period') && (
                  <ReportsView
                    materials={materials}
                    departments={departments}
                    movements={movements}
                    initialSubTab={
                      currentView === 'reports-critical'
                        ? 'critical'
                        : currentView === 'reports-period'
                        ? 'period'
                        : 'position'
                    }
                  />
                )}

                {/* Rota 7: Dicas de Boas Práticas */}
                {currentView === 'best-practices' && (
                  <BestPracticesView />
                )}

                {/* Rota 8: Backup & Governança */}
                {currentView === 'backup' && (
                  <BackupView
                    materials={materials}
                    departments={departments}
                    movements={movements}
                    requisitions={requisitions}
                    onDataRestored={loadAllData}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Rodapé Corporativo com Identificação do Responsável Técnico */}
      <footer className="no-print bg-[#050B1E] border-t border-blue-900/40 py-3 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} SGI Estoque Enterprise • Gestão de Materiais e Setores
          </div>
          <div className="text-slate-400">
            Responsável Técnico: <strong className="text-amber-400">Victor Hugo</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
