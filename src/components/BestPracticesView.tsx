import React, { useState } from 'react';
import {
  BookOpen,
  Calculator,
  ShieldCheck,
  CheckSquare,
  TrendingDown,
  Layers,
  Sparkles,
  Award,
  Zap,
  Boxes
} from 'lucide-react';

export const BestPracticesView: React.FC = () => {
  // Calculadora Interativa de Estoque Mínimo & Ponto de Pedido (ROP)
  const [dailyDemand, setDailyDemand] = useState<number>(10);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(7);
  const [safetyMarginPercent, setSafetyMarginPercent] = useState<number>(30);

  // Cálculos matemáticos de gestão de estoque
  const demandDuringLeadTime = dailyDemand * leadTimeDays;
  const safetyStock = Math.ceil(demandDuringLeadTime * (safetyMarginPercent / 100));
  const reorderPoint = demandDuringLeadTime + safetyStock;
  const maxSuggestedStock = reorderPoint + (dailyDemand * 15); // Lote de compra para 15 dias

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-blue-900/40 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-amber-400 rounded-xs inline-block"></span>
            Guia de Boas Práticas em Controle de Estoque
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Metodologias consagradas de supply chain, cálculo de estoque de segurança e organização física industrial.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-lg text-amber-300 text-xs font-semibold self-start sm:self-auto">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Manual Corporativo SGI Enterprise</span>
        </div>
      </div>

      {/* Bloco Interativo: Calculadora de Ponto de Reposição (ROP) & Estoque Mínimo */}
      <div className="bg-[#0D1B36] border border-amber-500/40 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Simulador Matemático: Ponto de Reposição (ROP) & Estoque de Segurança
            </h2>
            <p className="text-xs text-slate-400">
              Utilize a fórmula padrão para determinar o momento exato de disparar a ordem de compra de um material.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
          {/* Entradas */}
          <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-blue-900/40">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              Parâmetros de Entrada
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Consumo Médio Diário (CMD):
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min={1}
                  value={dailyDemand}
                  onChange={(e) => setDailyDemand(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-blue-900/60 rounded text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                />
                <span className="ml-2 text-xs text-slate-400 font-mono">unid./dia</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Tempo de Reposição do Fornecedor (Lead Time):
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min={1}
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-blue-900/60 rounded text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                />
                <span className="ml-2 text-xs text-slate-400 font-mono">dias úteis</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Margem de Segurança (Incerteza):
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={safetyMarginPercent}
                  onChange={(e) => setSafetyMarginPercent(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-blue-900/60 rounded text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                />
                <span className="ml-2 text-xs text-slate-400 font-mono">% margem</span>
              </div>
            </div>
          </div>

          {/* Resultados Calculados */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 self-center">
            <div className="bg-[#091224] p-4 rounded-xl border border-blue-900/50 text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Consumo no Lead Time
              </span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {demandDuringLeadTime}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Demanda consumida até o pedido chegar</p>
            </div>

            <div className="bg-[#091224] p-4 rounded-xl border border-blue-900/50 text-center">
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">
                Estoque Mínimo (Segurança)
              </span>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                {safetyStock}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Proteção contra atrasos e picos de demanda</p>
            </div>

            <div className="bg-gradient-to-br from-[#13274F] to-[#0A1630] p-4 rounded-xl border border-amber-400/60 text-center shadow-lg">
              <span className="text-[10px] uppercase tracking-wider text-amber-300 font-extrabold block">
                Ponto de Pedido (ROP)
              </span>
              <div className="text-3xl font-black text-amber-300 font-mono mt-1">
                {reorderPoint}
              </div>
              <p className="text-[10px] text-slate-300 mt-1 font-semibold">Comprar quando o estoque atingir este valor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de 4 Pilares de Boas Práticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pilar 1: Registro Imediato em Tempo Real */}
        <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Zap className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              1. Registro Imediato em Tempo Real (Zero Atrasos)
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Nunca permita a retirada física de materiais sem o respectivo registro ou requisição aprovada no sistema.
            O descompasso entre o estoque virtual e o físico acontece quase exclusivamente por retiradas não registradas
            ("retiro agora e anoto depois").
          </p>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-blue-900/30 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              Regra de Ouro:
            </div>
            <p>
              "Nenhum parafuso entra sem Nota e nenhum componente sai sem Requisição vinculada a um Setor."
            </p>
          </div>
        </div>

        {/* Pilar 2: Curva ABC de Gestão de Suprimentos */}
        <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Layers className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              2. Classificação de Itens por Curva ABC
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Aplique o Princípio de Pareto (80/20) para categorizar seu estoque e focar a energia onde há maior valor financeiro:
          </p>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded border-l-2 border-red-500 text-[11px]">
              <span className="font-bold text-white">Classe A (~20% itens | ~80% valor):</span>
              <span className="text-slate-400">Controle rigoroso diário/semanal e negociações diretas.</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded border-l-2 border-amber-500 text-[11px]">
              <span className="font-bold text-white">Classe B (~30% itens | ~15% valor):</span>
              <span className="text-slate-400">Controle moderado e inventários quinzenais.</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded border-l-2 border-blue-500 text-[11px]">
              <span className="font-bold text-white">Classe C (~50% itens | ~5% valor):</span>
              <span className="text-slate-400">Controle simples com lotes maiores para evitar faltas.</span>
            </div>
          </div>
        </div>

        {/* Pilar 3: Metodologia 5S no Almoxarifado */}
        <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2.5 text-blue-400">
            <Boxes className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              3. Organização Física com 5S Industrial
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            A desorganização visual do armazém gera compras duplicadas, perdas por validade e demora no atendimento de ordens de serviço:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
            <li><strong className="text-slate-200">Seiri (Descarte):</strong> Elimine sucatas, peças obsoletas ou sem movimentação há mais de 1 ano.</li>
            <li><strong className="text-slate-200">Seiton (Organização):</strong> Cada material com código visível, etiqueta e endereço fixo (ex: Rua A, Prateleira 03).</li>
            <li><strong className="text-slate-200">Seiso (Limpeza):</strong> Ambiente limpo evita contaminação de óleos, filtros e componentes eletrônicos sensíveis.</li>
            <li><strong className="text-slate-200">Seiketsu (Padronização):</strong> Identificação cromática para EPIs, ferramentas e químicos.</li>
          </ul>
        </div>

        {/* Pilar 4: Inventários Rotativos / Cíclicos */}
        <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2.5 text-purple-400">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              4. Inventários Rotativos Cíclicos vs. Anuais
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Não espere o final do ano para descobrir divergências contábeis. Divida o almoxarifado em setores e conte 5 a 10 itens por dia:
          </p>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-blue-900/30 text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-white">Vantagens comprovadas:</p>
            <p className="text-[11px] text-slate-400">
              • Identificação rápida de desvios e erros de lançamento.<br />
              • A empresa nunca precisa parar as operações para fazer balanço geral.<br />
              • Acuracidade do estoque mantida acima de 98%.
            </p>
          </div>
        </div>
      </div>

      {/* Checklist de Rotina Diária do Responsável Técnico */}
      <div className="bg-[#0D1B36] border border-blue-900/50 rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white tracking-tight mb-3 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-amber-400" />
          Checklist Recomendado de Rotina Operacional Diária
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-900/60 rounded-lg border border-blue-900/40 space-y-1.5">
            <div className="font-bold text-amber-300 uppercase text-[10px]">Início do Expediente</div>
            <p className="text-slate-300">1. Consultar painel de <strong>Itens Críticos</strong> para priorizar compras.</p>
            <p className="text-slate-300">2. Conferir requisições <strong>Pendentes</strong> emitidas pelos setores.</p>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-lg border border-blue-900/40 space-y-1.5">
            <div className="font-bold text-blue-300 uppercase text-[10px]">Durante o Dia</div>
            <p className="text-slate-300">1. Lançar <strong>Entradas</strong> imediatamente após conferência física da NF-e.</p>
            <p className="text-slate-300">2. Baixar <strong>Saídas</strong> com assinatura ou comprovação do requisitante.</p>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-lg border border-blue-900/40 space-y-1.5">
            <div className="font-bold text-emerald-300 uppercase text-[10px]">Fim do Expediente</div>
            <p className="text-slate-300">1. Conferir se todas as saídas foram salvas.</p>
            <p className="text-slate-300">2. Realizar <strong>Backup de Segurança</strong> dos dados na aba de Backup.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
