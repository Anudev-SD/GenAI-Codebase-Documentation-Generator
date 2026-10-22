import React from 'react';
import { GitBranch, Wrench, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

interface StageFlowTracerProps {
  flow: any;
}

export const StageFlowTracer: React.FC<StageFlowTracerProps> = ({ flow }) => {
  if (!flow) return null;

  return (
    <div className="space-y-6">
      {/* Pattern Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-emerald-950/30 border border-blue-800/40 rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-zinc-100 text-sm">Detected Architecture Pattern</span>
          </div>
          <span className="font-mono text-xs font-bold uppercase px-2.5 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {flow.architecture_pattern.replace('_', ' ')}
          </span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">{flow.workflow_summary}</p>
      </div>

      {/* Traced Execution Graph Steps */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
        <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-emerald-400" /> Pipeline Graph Nodes & Transitions ({flow.steps.length})
        </h4>

        <div className="space-y-3">
          {flow.steps.map((step: any, idx: number) => (
            <div key={idx} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-mono flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-zinc-200 text-sm">{step.step_name}</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                    {step.step_type}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">{step.description}</p>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                <span className="bg-[#161b22] px-2 py-1 rounded text-zinc-400 border border-[#21262d]">
                  In: {step.inputs.join(', ')}
                </span>
                <ArrowRight className="w-3 h-3 text-zinc-600" />
                <span className="bg-[#161b22] px-2 py-1 rounded text-emerald-400 border border-[#21262d]">
                  Out: {step.outputs.join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* External Tool Invocations */}
      {flow.tools && flow.tools.length > 0 && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
          <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" /> External Tool Calls & Sandboxes
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {flow.tools.map((tool: any, idx: number) => (
              <div key={idx} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-zinc-200 text-xs">{tool.name}</span>
                  <span
                    className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                      tool.risk_level === 'high'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : tool.risk_level === 'medium'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {tool.risk_level} Risk
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mb-1">{tool.description}</p>
                <span className="text-[10px] font-mono text-zinc-500">Source: {tool.source_file}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
