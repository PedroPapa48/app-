import React from 'react';
import { PlanData } from '../types';
import { Copy, Check, Download, Printer, FileText, Table } from 'lucide-react';
import { downloadICS } from '../utils/icsExport';

interface MarkdownTableViewProps {
  plan: PlanData;
}

export const MarkdownTableView: React.FC<MarkdownTableViewProps> = ({ plan }) => {
  const [copied, setCopied] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'table' | 'raw'>('table');

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(plan.markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top action toolbar */}
      <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-lg">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'table'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Formato Tabla Oficial</span>
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'raw'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Markdown Puro</span>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadICS(plan.scheduleBlocks)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Exportar archivo .ics para Google Calendar, Apple Calendar u Outlook"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Calendario (.ics)</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors hidden sm:flex"
            title="Imprimir hoja de estudio diario"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Markdown</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content Display */}
      {viewMode === 'table' ? (
        <div className="p-6 space-y-6">
          {/* Header section */}
          <div className="space-y-3 pb-5 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>🧭 Diagnóstico Rápido</span>
            </h2>
            <ul className="space-y-1.5 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-slate-100">Índice de Viabilidad de la Jornada:</span>
                <span className="font-mono text-emerald-400 font-medium">{plan.viabilityIndex}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-slate-100">Enfoque Clave del Día:</span>
                <span className="text-amber-300">{plan.keyFocus}</span>
              </li>
            </ul>
          </div>

          {/* Schedule Table */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>📅 Cronograma Maestro del Día</span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
              <table className="w-full text-left text-sm text-slate-200">
                <thead className="bg-slate-800/90 text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-700">
                  <tr>
                    <th scope="col" className="py-3 px-4 w-32">Horario</th>
                    <th scope="col" className="py-3 px-4 w-44">Tipo</th>
                    <th scope="col" className="py-3 px-4">Actividad / Materia</th>
                    <th scope="col" className="py-3 px-4">Estrategia / Instrucción Clave</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {plan.scheduleBlocks.map((block, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-xs font-medium text-slate-300 whitespace-nowrap">
                        <code className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-indigo-300">
                          {block.startTime} - {block.endTime}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium whitespace-nowrap">
                        <span>{block.type}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-white">
                        {block.title}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400 leading-relaxed">
                        {block.strategy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2-Min Takeoff & Emergency Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            {/* Takeoff Card */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
              <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <span>🚀 Despegue Inmediato (Anti-Procrastinación)</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-amber-200">Técnica de los 2 Minutos: </strong>
                {plan.twoMinuteTakeoff}
              </p>
            </div>

            {/* Emergency Rule Card */}
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
              <h4 className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
                <span>⚠️ Regla de Emergencia</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {plan.emergencyRule}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed whitespace-pre-wrap select-all">
            {plan.markdownContent}
          </pre>
        </div>
      )}
    </div>
  );
};
