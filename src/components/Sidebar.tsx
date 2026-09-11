import React from 'react';
import {
  LayoutDashboard,
  Package,
  Building2,
  ArrowLeftRight,
  FileText,
  BarChart3,
  BookOpen,
  Database,
  X,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  criticalCount: number;
  pendingReqCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpenMobile,
  onCloseMobile,
  criticalCount,
  pendingReqCount
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Indicadores',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'materials',
      label: 'Materiais',
      icon: Package,
      badge: criticalCount > 0 ? { count: criticalCount, color: 'bg-amber-500 text-slate-950' } : null
    },
    {
      id: 'departments',
      label: 'Setores & Departamentos',
      icon: Building2,
      badge: null
    },
    {
      id: 'movements',
      label: 'Movimentações (E/S)',
      icon: ArrowLeftRight,
      badge: null
    },
    {
      id: 'requisitions',
      label: 'Requisições de Materiais',
      icon: FileText,
      badge: pendingReqCount > 0 ? { count: pendingReqCount, color: 'bg-blue-500 text-white' } : null
    },
    {
      id: 'reports',
      label: 'Relatórios Gerenciais',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'best-practices',
      label: 'Dicas de Boas Práticas',
      icon: BookOpen,
      badge: { count: 'Guia', color: 'bg-amber-400/20 text-amber-300 border border-amber-400/40' }
    },
    {
      id: 'backup',
      label: 'Backup & Dados',
      icon: Database,
      badge: null
    }
  ];

  const handleSelect = (viewId: string) => {
    onSelectView(viewId);
    onCloseMobile();
  };

  return (
    <>
      {/* Overlay Mobile */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/80 z-40 md:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Barra Lateral */}
      <aside
        className={`no-print fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0B132B] border-r border-blue-900/40 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Topo Mobile (Fechar) */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-blue-900/40">
          <span className="text-sm font-bold text-amber-400 tracking-wider uppercase">Menu de Navegação</span>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Itens do Menu */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Módulos do Sistema
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'reports' && currentView.startsWith('reports'));

            return (
              <button
                key={item.id}
                id={`menu-item-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-amber-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${item.badge.color}`}
                  >
                    {item.badge.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Rodapé da Barra Lateral: Informações de Versão & Responsável Técnico */}
        <div className="p-4 border-t border-blue-900/40 bg-slate-900/50">
          <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">SGI Estoque v1.0 Enterprise</span>
          </div>
          <p className="text-[10px] text-amber-300 font-semibold leading-tight">
            Resp. Técnico: Victor Hugo
          </p>
          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
            Persistência ativa em banco local.
          </p>
        </div>
      </aside>
    </>
  );
};
