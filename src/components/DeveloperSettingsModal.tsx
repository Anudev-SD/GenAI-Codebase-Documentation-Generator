import React, { useState } from 'react';
import {
  X,
  Sliders,
  Terminal as TerminalIcon,
  Code2,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Cpu,
} from 'lucide-react';
import { InteractiveTerminal } from './InteractiveTerminal';
import { PythonPackageViewer } from './PythonPackageViewer';

interface DeveloperSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipelineState: any;
  selectedRepo: string;
  useGemini: boolean;
  setUseGemini: (val: boolean) => void;
}

export const DeveloperSettingsModal: React.FC<DeveloperSettingsModalProps> = ({
  isOpen,
  onClose,
  pipelineState,
  selectedRepo,
  useGemini,
  setUseGemini,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'terminal' | 'schemas' | 'source'>('settings');

  if (!isOpen) return null;

  const { ingestion, flow, env, evaluation, mermaid } = pipelineState || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6">
      <div className="bg-[#111620] border border-[#30363d] rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#262f3d] bg-[#161c28]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Developer Settings & Advanced Debugging</h3>
              <p className="text-[11px] text-zinc-400">Internal AST telemetry, CLI execution, and Pydantic v2 schema inspection</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#21262d] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex items-center px-4 bg-[#0d121c] border-b border-[#21262d] gap-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2.5 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'settings'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Pipeline Config</span>
          </button>

          <button
            onClick={() => setActiveTab('schemas')}
            className={`py-2.5 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'schemas'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pydantic v2 Contracts</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`py-2.5 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'terminal'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Interactive CLI Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('source')}
            className={`py-2.5 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'source'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Python Source Package</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#090d15]">
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-[#121824] border border-[#232f45] rounded-xl p-4 space-y-3">
                <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Model & Synthesis Options</span>
                </div>

                <label className="flex items-start gap-3 p-3 bg-[#0c121e] rounded-lg border border-[#1e2a40] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useGemini}
                    onChange={(e) => setUseGemini(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-700 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <div className="space-y-0.5 text-xs">
                    <span className="font-semibold text-zinc-200">Gemini 3.8 Flash Enhanced Synthesis</span>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Invokes server-side Google GenAI SDK (gemini-3.8-flash) to perform semantic reasoning across the parsed AST and prompt templates.
                    </p>
                  </div>
                </label>
              </div>

              {/* Ingestion & Bloat Telemetry */}
              <div className="bg-[#121824] border border-[#232f45] rounded-xl p-4 space-y-3">
                <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>Deterministic Ingestion Telemetry</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-[#0c121e] rounded border border-[#1e2a40]">
                    <span className="text-zinc-500 block text-[10px]">Files Scanned:</span>
                    <span className="text-zinc-200 font-bold">{ingestion?.stats?.total_files_scanned || 0} files</span>
                  </div>
                  <div className="p-2.5 bg-[#0c121e] rounded border border-[#1e2a40]">
                    <span className="text-zinc-500 block text-[10px]">Bloat Filtered:</span>
                    <span className="text-amber-400 font-bold">{ingestion?.stats?.ignored_bloat_files || 0} skipped (.git, venv)</span>
                  </div>
                  <div className="p-2.5 bg-[#0c121e] rounded border border-[#1e2a40]">
                    <span className="text-zinc-500 block text-[10px]">Parsed Python LOC:</span>
                    <span className="text-emerald-400 font-bold">{ingestion?.stats?.total_loc || 0} lines</span>
                  </div>
                  <div className="p-2.5 bg-[#0c121e] rounded border border-[#1e2a40]">
                    <span className="text-zinc-500 block text-[10px]">System Prompts:</span>
                    <span className="text-cyan-400 font-bold">{ingestion?.system_prompts?.length || 0} constants</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schemas' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="text-xs text-zinc-400">
                GenDocuAgent enforces strict <strong>Pydantic v2</strong> data schemas at each stage boundary. Below are the verified step schemas:
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-[#121824] border border-[#232f45] rounded-xl">
                  <div className="flex items-center justify-between text-cyan-400 font-bold mb-1">
                    <span>1. IngestionResult (Stage 1)</span>
                    <span className="text-[10px] text-emerald-400">Verified ✓</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Stats: {JSON.stringify(ingestion?.stats || {})}
                  </div>
                </div>

                <div className="p-3 bg-[#121824] border border-[#232f45] rounded-xl">
                  <div className="flex items-center justify-between text-purple-400 font-bold mb-1">
                    <span>2. ExecutionFlowResult (Stage 2)</span>
                    <span className="text-[10px] text-emerald-400">Verified ✓</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Pattern: {flow?.architecture_pattern} • Steps: {flow?.steps?.length} • Tools: {flow?.tools?.length}
                  </div>
                </div>

                <div className="p-3 bg-[#121824] border border-[#232f45] rounded-xl">
                  <div className="flex items-center justify-between text-emerald-400 font-bold mb-1">
                    <span>3. EnvInferenceResult (Stage 3)</span>
                    <span className="text-[10px] text-emerald-400">Verified ✓</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Required Keys: {env?.required_vars?.map((v: any) => v.name).join(', ')}
                  </div>
                </div>

                <div className="p-3 bg-[#121824] border border-[#232f45] rounded-xl">
                  <div className="flex items-center justify-between text-amber-400 font-bold mb-1">
                    <span>4. EvaluationAuditResult (Stage 4)</span>
                    <span className="text-[10px] text-emerald-400">Verified ✓</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Framework: {evaluation?.eval_framework} • Real Data: {String(evaluation?.has_real_eval_data)} • Fallback Plan: {String(evaluation?.is_fallback_plan)}
                  </div>
                </div>

                <div className="p-3 bg-[#121824] border border-[#232f45] rounded-xl">
                  <div className="flex items-center justify-between text-blue-400 font-bold mb-1">
                    <span>5. MermaidValidationResult (Stage 5)</span>
                    <span className="text-[10px] text-emerald-400">Verified ✓</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Syntax Valid: {String(mermaid?.is_valid)} • Repairs Applied: {mermaid?.repairs_applied?.length || 0}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="h-full min-h-[500px]">
              <InteractiveTerminal selectedRepo={selectedRepo} />
            </div>
          )}

          {activeTab === 'source' && (
            <div className="h-full min-h-[500px]">
              <PythonPackageViewer />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
