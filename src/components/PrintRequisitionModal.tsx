import React from 'react';
import { Requisition } from '../types.ts';
import { Printer, X, ShieldCheck, Calendar, Building2, User, FileText, CheckCircle2 } from 'lucide-react';

interface PrintRequisitionModalProps {
  requisition: Requisition | null;
  onClose: () => void;
}

export const PrintRequisitionModal: React.FC<PrintRequisitionModalProps> = ({
  requisition,
  onClose
}) => {
  if (!requisition) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val?: number) => {
    if (!val) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  const totalEstimatedCost = requisition.items.reduce(
    (acc, item) => acc + (item.quantityRequested * (item.unitCost || 0)),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xs overflow-y-auto">
      {/* Container do Modal */}
      <div className="bg-[#0B132B] border border-blue-900/60 rounded-xl shadow-2xl max-w-4xl w-full max-h-[96vh] flex flex-col overflow-hidden">
        {/* Barra de Ações Superior (Escondida na impressão) */}
        <div className="no-print bg-[#070F2B] px-6 py-3.5 border-b border-blue-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Emissão de Requisição Oficial de Materiais (Visualização para Impressão / PDF)
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">
                {requisition.code} • Status: {requisition.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              id="btn-print-requisition"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Folha A4 Formatada para Impressão */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-900/40">
          <div
            id="printable-requisition-sheet"
            className="print-sheet max-w-3xl mx-auto bg-white text-slate-900 p-8 sm:p-10 rounded-lg shadow-xl border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0"
          >
            {/* Cabeçalho Oficial com Dados da Empresa */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
                    Sistema de Gestão Empresarial • Módulo Almoxarifado
                  </div>
                  <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                    REQUISIÇÃO INTERNA DE MATERIAIS
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Controle Integrado de Suprimentos, Atendimento e Auditoria de Estoque
                  </p>
                </div>

                {/* Caixa do Código e Status */}
                <div className="text-right">
                  <div className="inline-block border-2 border-slate-900 px-4 py-1.5 rounded bg-slate-50">
                    <div className="text-[10px] font-bold uppercase text-slate-500">N° Documento</div>
                    <div className="text-lg font-black font-mono text-slate-950">{requisition.code}</div>
                  </div>
                  <div className="mt-1.5 text-[11px] font-bold">
                    <span className="uppercase text-slate-600 mr-1">Status:</span>
                    <span className="px-2 py-0.5 bg-slate-200 border border-slate-400 rounded text-[10px] font-black uppercase">
                      {requisition.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadados da Requisição (Setor, Requisitante, Data, Prioridade) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-md text-xs mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Setor Solicitante:</span>
                <span className="font-bold text-slate-900 text-sm">{requisition.departmentName}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Solicitante:</span>
                <span className="font-bold text-slate-900">{requisition.requesterName}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Data de Emissão:</span>
                <span className="font-mono font-semibold text-slate-900">{requisition.date}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Prioridade:</span>
                <span className="font-black text-slate-900 uppercase">{requisition.priority}</span>
              </div>
            </div>

            {/* Finalidade / Justificativa */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Finalidade / Aplicação dos Materiais:
              </h3>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 leading-relaxed font-serif">
                {requisition.reason || 'Consumo operacional de rotina.'}
              </div>
            </div>

            {/* Tabela de Itens da Requisição */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Itens Solicitados:
              </h3>
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-3 border-r border-slate-300 w-12 text-center">Item</th>
                    <th className="py-2 px-3 border-r border-slate-300 w-24">Código</th>
                    <th className="py-2 px-3 border-r border-slate-300">Descrição do Material</th>
                    <th className="py-2 px-3 border-r border-slate-300 text-center w-16">Unid.</th>
                    <th className="py-2 px-3 border-r border-slate-300 text-right w-20">Qtd. Sol.</th>
                    <th className="py-2 px-3 border-r border-slate-300 text-right w-20">Qtd. Atend.</th>
                    <th className="py-2 px-3 text-right w-28">Custo Est. (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {requisition.items.map((item, index) => {
                    const itemTotal = item.quantityRequested * (item.unitCost || 0);
                    return (
                      <tr key={item.materialId} className="even:bg-slate-50/50">
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono font-semibold">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-mono font-bold text-slate-900">
                          {item.materialCode}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-semibold text-slate-900">
                          {item.materialName}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono font-bold">
                          {item.unit}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                          {item.quantityRequested}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono text-slate-800">
                          {item.quantityFulfilled !== undefined ? item.quantityFulfilled : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                          {formatCurrency(itemTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td colSpan={6} className="py-2 px-3 text-right text-xs uppercase">
                      Valor Total Estimado da Requisição:
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-xs text-slate-950 font-black">
                      {formatCurrency(totalEstimatedCost)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Observações */}
            {requisition.observations && (
              <div className="mb-6">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Observações do Almoxarifado / Gestão:
                </span>
                <p className="text-xs text-slate-700 italic bg-slate-50 p-2 border border-slate-200 rounded">
                  {requisition.observations}
                </p>
              </div>
            )}

            {/* Bloco Oficial de Assinaturas e Recebimento */}
            <div className="pt-6 border-t border-slate-300 mt-8">
              <div className="grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="border-b border-slate-900 h-10 mb-2"></div>
                  <span className="font-bold text-slate-900 block">{requisition.requesterName}</span>
                  <span className="text-[10px] text-slate-500 uppercase">Solicitante (Setor)</span>
                </div>

                <div>
                  <div className="border-b border-slate-900 h-10 mb-2"></div>
                  <span className="font-bold text-slate-900 block">
                    {requisition.authorizedBy || 'Autorização da Gestão'}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">Gestor Aprovador</span>
                </div>

                <div>
                  <div className="border-b border-slate-900 h-10 mb-2"></div>
                  <span className="font-bold text-slate-900 block">Almoxarifado Central</span>
                  <span className="text-[10px] text-slate-500 uppercase">Responsável pela Entrega</span>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-dashed border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <span>
                  Responsável Técnico: <strong>Victor Hugo</strong>
                </span>
                <span>
                  Data e hora de emissão: {new Date().toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
