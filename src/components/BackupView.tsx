import React, { useState, useRef } from 'react';
import { api } from '../services/api.ts';
import { Material, Department, Movement, Requisition } from '../types.ts';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  FileJson,
  ShieldAlert
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
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('ATENÇÃO: Restaurar um backup substituirá a base de dados atual. Deseja prosseguir?')) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setIsImporting(true);
      setStatusMsg(null);

      const fileText = await file.text();
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
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-blue-900/40 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-amber-400 rounded-xs inline-block"></span>
            Backup e Governança de Dados
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Exportação completa para salvaguarda, restauração de emergência e integridade das informações.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
              : 'bg-red-950/70 border-red-700 text-red-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Estatísticas da Base de Dados Atual */}
      <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-5 shadow-lg">
        <h2 className="text-sm font-bold text-white tracking-tight mb-4 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-amber-400" />
          Status Atual da Base de Dados Persistente
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-900/60 p-3 rounded-lg border border-blue-900/30">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Materiais Cadastrados</span>
            <span className="text-xl font-black text-white font-mono">{materials.length}</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-blue-900/30">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Setores e Departamentos</span>
            <span className="text-xl font-black text-white font-mono">{departments.length}</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-blue-900/30">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Histórico de Movimentações</span>
            <span className="text-xl font-black text-amber-400 font-mono">{movements.length}</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-blue-900/30">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Requisições Emitidas</span>
            <span className="text-xl font-black text-blue-400 font-mono">{requisitions.length}</span>
          </div>
        </div>
      </div>

      {/* Ações de Backup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exportar Backup */}
        <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-6 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Exportar Backup Completo (JSON)
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Gera um snapshot completo de todos os materiais, setores, histórico de movimentações, custos e requisições. O arquivo pode ser guardado com segurança ou migrado para outro servidor.
            </p>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-md transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exportando dados...' : 'Baixar Arquivo de Backup'}</span>
          </button>
        </div>

        {/* Restaurar Backup */}
        <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-6 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Restaurar Backup de Dados
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Carregue um arquivo JSON gerado anteriormente por este sistema para recuperar dados ou sincronizar o ambiente. Esta ação substituirá os registros atuais.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
              id="file-backup-input"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isImporting ? 'Restaurando base...' : 'Selecionar Arquivo JSON para Restaurar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Aviso de Governança */}
      <div className="bg-[#091224] p-4 rounded-xl border border-blue-900/40 flex items-start gap-3 text-xs text-slate-400">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-white">Política de Salvaguarda:</strong> Recomenda-se a realização semanal de backup dos dados de estoque para atendimento às normas de auditoria e conformidade contábil.
        </p>
      </div>
    </div>
  );
};
