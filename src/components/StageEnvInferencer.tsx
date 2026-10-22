import React, { useState } from 'react';
import { KeyRound, ShieldCheck, Copy, Check, Lock } from 'lucide-react';

interface StageEnvInferencerProps {
  env: any;
}

export const StageEnvInferencer: React.FC<StageEnvInferencerProps> = ({ env }) => {
  const [copied, setCopied] = useState<boolean>(false);
  if (!env) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(env.dotenv_template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Required Environment Variables */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400" /> Inferred Required Secrets ({env.required_vars.length})
          </h4>
          <span className="text-[11px] font-mono text-zinc-500">Inferred from AST lookups & framework imports</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {env.required_vars.map((v: any, idx: number) => (
            <div key={idx} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-cyan-400 font-bold text-xs">{v.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Required
                </span>
              </div>
              <p className="text-xs text-zinc-400 mb-1">{v.description}</p>
              <div className="text-[10px] text-zinc-500 font-mono">
                Service: <span className="text-zinc-300">{v.service}</span> • Inferred: {v.inferred_from}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optional Variables */}
      {env.optional_vars && env.optional_vars.length > 0 && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
          <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" /> Optional Tuning & Telemetry
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {env.optional_vars.map((v: any, idx: number) => (
              <div key={idx} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-amber-400 font-semibold text-xs">{v.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Optional
                  </span>
                </div>
                <p className="text-xs text-zinc-400">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated .env.example Preview */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Auto-Generated .env.example Blueprint
          </h4>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#21262d] hover:bg-[#30363d] text-zinc-200 rounded text-xs transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="p-3 bg-[#0d1117] border border-[#21262d] rounded-lg font-mono text-xs text-emerald-300/90 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
          {env.dotenv_template}
        </pre>
      </div>
    </div>
  );
};
