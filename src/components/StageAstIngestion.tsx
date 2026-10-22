import React from 'react';
import { Filter, Layers, FileCode, CheckCircle2, Cpu, Hash } from 'lucide-react';

interface StageAstIngestionProps {
  ingestion: any;
}

export const StageAstIngestion: React.FC<StageAstIngestionProps> = ({ ingestion }) => {
  if (!ingestion) return null;

  const { stats, frameworks, system_prompts, raw_env_lookups } = ingestion;

  return (
    <div className="space-y-6">
      {/* Telemetry & Bloat Filter stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#161b22] border border-[#30363d] p-3.5 rounded-xl">
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span>Python Files</span>
          </div>
          <div className="text-xl font-bold font-mono text-zinc-100">{stats.python_files_parsed}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">{stats.total_loc} non-comment LOC</div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] p-3.5 rounded-xl">
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Bloat Ignored</span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">{stats.ignored_bloat_files}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">.git, venvs, binaries</div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] p-3.5 rounded-xl">
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Frameworks</span>
          </div>
          <div className="text-xl font-bold font-mono text-purple-400">{frameworks.length}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">AST import matching</div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] p-3.5 rounded-xl">
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
            <Hash className="w-3.5 h-3.5 text-emerald-400" />
            <span>System Prompts</span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{system_prompts.length}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Constants & templates</div>
        </div>
      </div>

      {/* Discovered Frameworks */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
        <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" /> Identified AI Frameworks & Vector Stores
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {frameworks.map((fw: any, idx: number) => (
            <div key={idx} className="bg-[#0d1117] border border-[#30363d] p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-zinc-200 text-sm">{fw.framework_name}</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {fw.category}
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">
                Symbols: <span className="text-zinc-300">{fw.imported_symbols.join(', ') || 'top-level'}</span>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-1 truncate">
                Discovered in: {fw.source_files.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Prompt Catalog */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
        <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Hash className="w-4 h-4 text-emerald-400" /> System Prompt Catalog (AST Ingestion)
        </h4>
        <div className="space-y-3">
          {system_prompts.map((p: any, idx: number) => (
            <div key={idx} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 font-semibold text-xs">{p.variable_name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {p.prompt_type}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 font-mono">
                  ~{p.tokens_estimate} tokens • <span className="text-zinc-400">{p.source_file}</span>
                </div>
              </div>

              {p.parameters && p.parameters.length > 0 && (
                <div className="flex items-center gap-1.5 mb-2 text-xs">
                  <span className="text-zinc-500 text-[11px]">Template Variables:</span>
                  {p.parameters.map((param: string, pIdx: number) => (
                    <span key={pIdx} className="font-mono text-[11px] px-1.5 py-0.5 bg-[#21262d] text-amber-400 rounded">
                      {`{${param}}`}
                    </span>
                  ))}
                </div>
              )}

              <pre className="text-xs font-mono text-zinc-300 bg-[#161b22] p-2.5 rounded border border-[#21262d] whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                {p.content}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
