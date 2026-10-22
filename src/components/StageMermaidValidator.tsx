import React, { useState } from 'react';
import { CheckCircle2, Wrench, AlertTriangle, RefreshCw, Code, Eye } from 'lucide-react';
import { MermaidViewer } from './MermaidViewer';

interface StageMermaidValidatorProps {
  mermaid: any;
  onUpdateDiagram?: (newCode: string) => void;
}

export const StageMermaidValidator: React.FC<StageMermaidValidatorProps> = ({ mermaid, onUpdateDiagram }) => {
  const [activeView, setActiveView] = useState<'visual' | 'code'>('visual');
  const [editableCode, setEditableCode] = useState<string>(mermaid?.validated_code || '');
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const [validationResponse, setValidationResponse] = useState<any>(mermaid);

  if (!mermaid) return null;

  const currentResult = validationResponse || mermaid;

  const handleRevalidate = async () => {
    setIsRevalidating(true);
    try {
      const res = await fetch('/api/validate-mermaid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: editableCode }),
      });
      const data = await res.json();
      setValidationResponse(data);
      if (data.validated_code) {
        setEditableCode(data.validated_code);
        onUpdateDiagram?.(data.validated_code);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRevalidating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Validation Status & Summary */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-zinc-100 text-sm">Mermaid.js Cyclic Validation Loop</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified Clean
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Validated graph balance, node label quotation, and subgraph encapsulation before writing to documentation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#0d1117] p-1 rounded-lg border border-[#30363d] flex items-center">
            <button
              onClick={() => setActiveView('visual')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeView === 'visual' ? 'bg-[#21262d] text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Diagram
            </button>
            <button
              onClick={() => setActiveView('code')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeView === 'code' ? 'bg-[#21262d] text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" /> Source
            </button>
          </div>
        </div>
      </div>

      {/* Repairs Applied Pill List */}
      {currentResult.repairs_applied && currentResult.repairs_applied.length > 0 && (
        <div className="bg-blue-950/20 border border-blue-800/40 rounded-xl p-3.5 text-xs text-blue-200 flex items-start gap-3">
          <Wrench className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-cyan-300">Automated Pipeline Repairs Executed:</span>
            <ul className="list-disc list-inside text-zinc-300 space-y-0.5">
              {currentResult.repairs_applied.map((r: string, idx: number) => (
                <li key={idx} className="font-mono text-[11px]">{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Diagram or Code View */}
      {activeView === 'visual' ? (
        <MermaidViewer code={editableCode} />
      ) : (
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">Interactive Syntax Editor</span>
            <button
              onClick={handleRevalidate}
              disabled={isRevalidating}
              className="flex items-center gap-1.5 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRevalidating ? 'animate-spin' : ''}`} />
              <span>Validate & Repair</span>
            </button>
          </div>
          <textarea
            value={editableCode}
            onChange={(e) => setEditableCode(e.target.value)}
            className="w-full h-80 bg-[#0d1117] border border-[#30363d] rounded-lg p-3 font-mono text-xs text-emerald-300/90 focus:outline-none focus:border-cyan-500"
          />
        </div>
      )}
    </div>
  );
};
