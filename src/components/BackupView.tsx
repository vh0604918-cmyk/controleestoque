import React, { useState, useRef } from 'react';
import { api } from '../services/api.ts';
import { Material, Department, Movement, Requisition } from '../types.ts';
import { ConfirmModal } from './ConfirmModal.tsx';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  FileJson,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';

interface BackupViewProps {
  materials: Material[];
  departments: Department[];
  movements: Movement[];
  requisitions: Requisition[];
  onDataRestored: () => void;
}

export const BackupView: React.FC<BackupViewProps> = ({
  materials,
  departments,
  movements,
  requisitions,
  onDataRestored
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setStatusMsg(null);
      const data = await api.exportBackup();

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-estoque-sgi-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMsg({
        type: 'success',
        text: 'Backup exportado com sucesso! Arquivo JSON gerado com todos os dados salvos.'
      });
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Falha ao exportar backup do banco de dados.'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
  };

  const handleConfirmImport = async () => {
    if (!pendingFile) return;

    try {
      setIsImporting(true);
      setStatusMsg(null);

      const fileText = await pendingFile.text();
      const parsedData = JSON.parse(fileText);

      await api.importBackup(parsedData);
      setStatusMsg({
        type: 'success',
        text: 'Base de dados restaurada com sucesso a partir do arquivo fornecido!'
      });
      onDataRestored();
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Arquivo de backup inválido ou corrompido.'
      });
    } finally {
      setIsImporting(false);
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmReset = async () => {
    try {
      setIsResetting(true);
      setStatusMsg(null);
      await api.resetDemo();
      setStatusMsg({
        type: 'success',
        text: 'Sistema redefinido com sucesso para a base original limpa (Victor Hugo como Responsável Técnico)!'
      });
      onDataRestored();
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Falha ao redefinir a base de dados.'
      });
    } finally {
      setIsResetting(false);
      setIsResetConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-blue-900/40 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-amber-400 rounded-xs inline-block"></span>
            Cópia de Segurança & Manutenção de Dados
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Exportação, importação e restauração completa da integridade da base de estoque.
          </p>
        </div>

        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Resetar / Fazer Tudo de Novo</span>
        </button>
      </div>

      {/* Alerta de Status */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold animate-fadeIn ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
              : 'bg-red-950/80 border-red-700 text-red-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Resumo da Base Atual */}
      <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-5 shadow-lg">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-amber-400" />
          <span>Estatísticas Atuais da Base Persistida</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-900/60 p-3 rounded-lg border border-blue-900/40">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Materiais</div>
            <div className="text-lg font-bold font-mono text-white mt-0.5">{materials.length}</div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-blue-900/40">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Setores</div>
            <div className="text-lg font-bold font-mono text-white mt-0.5">{departments.length}</div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-blue-900/40">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Movimentações</div>
            <div className="text-lg font-bold font-mono text-white mt-0.5">{movements.length}</div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-blue-900/40">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Requisições</div>
            <div className="text-lg font-bold font-mono text-white mt-0.5">{requisitions.length}</div>
          </div>
        </div>
      </div>

      {/* Painéis de Ação (Exportar, Importar, Resetar) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Exportar Backup */}
        <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-6 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Exportar Cópia Completa
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Gera um arquivo JSON integral contendo o catálogo de materiais, setores, todo o histórico de entradas e saídas e as requisições emitidas.
            </p>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-md transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exportando dados...' : 'Baixar Arquivo JSON'}</span>
          </button>
        </div>

        {/* Restaurar Backup */}
        <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-6 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Restaurar via Arquivo JSON
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Carregue um arquivo de backup previamente exportado. O sistema validará a estrutura dos dados e restaurará os registros salvos.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              id="file-backup-input"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow-md transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isImporting ? 'Restaurando base...' : 'Carregar Arquivo JSON'}</span>
            </button>
          </div>
        </div>

        {/* Resetar / Fazer Tudo de Novo */}
        <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-6 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 mb-3">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Reiniciar / Fazer Tudo de Novo
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Restaura a base oficial pré-configurada, recriando materiais, setores, saldos de estoque e histórico de movimentações com Victor Hugo como gestor.
            </p>
          </div>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            disabled={isResetting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isResetting ? 'Restaurando...' : 'Fazer Tudo de Novo (Reset)'}</span>
          </button>
        </div>
      </div>

      {/* Aviso de Governança */}
      <div className="bg-[#091224] p-4 rounded-xl border border-blue-900/40 flex items-start gap-3 text-xs text-slate-400">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-white">Política de Salvaguarda:</strong> Recomenda-se a realização semanal de backup dos dados de estoque para atendimento às normas de auditoria e conformidade contábil.
        </p>
      </div>

      {/* Confirmação de Restauração via Arquivo */}
      <ConfirmModal
        isOpen={!!pendingFile}
        title="Restaurar Cópia de Segurança"
        message={`Deseja realmente restaurar a base com o arquivo "${pendingFile?.name}"? Os registros atuais serão substituídos pelos dados do arquivo.`}
        confirmLabel="Sim, Restaurar Arquivo"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={handleConfirmImport}
        onCancel={() => {
          setPendingFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
      />

      {/* Confirmação de Reset / Fazer Tudo de Novo */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Fazer Tudo de Novo (Reset da Base)"
        message="Esta ação recriará todos os 10 materiais do catálogo, 6 setores organizacionais, 8 movimentações iniciais e 4 requisições corporativas completas, com Victor Hugo identificado como Responsável Técnico. Deseja prosseguir?"
        confirmLabel="Sim, Fazer Tudo de Novo"
        cancelLabel="Cancelar"
        isDestructive={false}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
