import React from 'react';
import { User } from '../types.ts';
import { Boxes, AlertTriangle, LogOut, UserCheck, Shield, Menu } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  criticalCount: number;
  onSelectView: (view: string) => void;
  toggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  criticalCount,
  onSelectView,
  toggleMobileMenu
}) => {
  return (
    <header className="no-print bg-[#070F2B] border-b border-blue-900/50 sticky top-0 z-30 shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Lado Esquerdo: Botão Mobile + Logo e Nome */}
          <div className="flex items-center space-x-3">
            <button
              id="btn-mobile-toggle"
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800 focus:outline-none"
              aria-label="Abrir Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div
              className="flex items-center space-x-3 cursor-pointer select-none"
              onClick={() => onSelectView('dashboard')}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Boxes className="w-6 h-6 text-slate-950 font-bold" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-white tracking-tight">
                    Controle de Estoque
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                    Enterprise
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Gestão Inteligente de Materiais & Setores
                </p>
              </div>
            </div>
          </div>

          {/* Centro: Responsável Técnico (Visível no Header) */}
          <div className="hidden lg:flex items-center px-3 py-1.5 rounded-full bg-slate-900/90 border border-blue-900/60 shadow-inner">
            <Shield className="w-3.5 h-3.5 text-amber-400 mr-2 shrink-0" />
            <span className="text-xs text-slate-300 font-medium">
              Responsável Técnico: <strong className="text-amber-300 font-semibold">Victor Hugo</strong>
            </span>
          </div>

          {/* Lado Direito: Alerta Crítico + Perfil do Usuário */}
          <div className="flex items-center space-x-3">
            {criticalCount > 0 && (
              <button
                id="btn-nav-critical-alert"
                onClick={() => onSelectView('reports-critical')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/15 border border-amber-500/40 text-amber-400 hover:bg-amber-500/25 rounded-lg text-xs font-semibold transition-all duration-200"
                title={`${criticalCount} material(is) em nível crítico ou falta`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Críticos:</span>
                <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full font-bold text-[11px]">
                  {criticalCount}
                </span>
              </button>
            )}

            {user && (
              <div className="flex items-center space-x-2 border-l border-blue-900/60 pl-3">
                <div className="hidden md:block text-right">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-amber-400 font-medium">
                    {user.role} • {user.department}
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-800 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold text-xs">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                </div>

                <button
                  id="btn-nav-logout"
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors"
                  title="Sair do Sistema"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
