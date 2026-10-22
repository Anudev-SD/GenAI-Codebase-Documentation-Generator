import React, { useState } from 'react';
import {
  FolderGit2,
  FolderOpen,
  Upload,
  Cpu,
  Sparkles,
  ArrowRight,
  FileCode,
  CheckCircle2,
  AlertCircle,
  FileText,
  Workflow,
  ShieldCheck,
  Flame,
  Terminal,
} from 'lucide-react';
import { WelcomeGuide } from './WelcomeGuide';

interface CodebaseSelectionViewProps {
  selectedRepo: string;
  onSelectRepo: (repoId: string) => void;
  onOpenCustomModal: () => void;
  customFiles: any[] | null;
  onStartAnalysis: () => void;
  isAnalyzing: boolean;
  useGemini: boolean;
  setUseGemini: (val: boolean) => void;
}

export const CodebaseSelectionView: React.FC<CodebaseSelectionViewProps> = ({
  selectedRepo,
  onSelectRepo,
  onOpenCustomModal,
  customFiles,
  onStartAnalysis,
  isAnalyzing,
  useGemini,
  setUseGemini,
}) => {
  const sampleOptions = [
    {
      id: 'agentic_rag',
      title: 'Agentic RAG with LangGraph, Chroma & Tavily',
      category: 'Agentic StateGraph & Vector Search',
      description:
        'Multi-node self-corrective RAG pipeline with ChromaDB vector store, dynamic Tavily web search fallback, and verified Ragas evaluation benchmark metrics (Faithfulness 0.942, Relevancy 0.915).',
      files: ['main.py', 'graph.py', 'retriever.py', 'prompts.py', 'eval_results.json'],
      tags: ['LangGraph', 'ChromaDB', 'Tavily', 'Ragas Evals (Verified)'],
      evalBadge: 'Verified Eval Logs (eval_results.json)',
      evalBadgeType: 'success',
      loc: '~184 LOC',
    },
    {
      id: 'code_agent_lite',
      title: 'Autonomous Code Agent with LiteLLM & Sandbox',
      category: 'ReAct Agent Loop & Code Execution',
      description:
        'Autonomous coding agent with LiteLLM reasoning, isolated sandbox execution, and tool routing. Intentionally missing eval logs to demonstrate automatic fallback to an "Intended Evaluation Plan".',
      files: ['agent.py', 'sandbox.py', 'tools.py', 'config.py'],
      tags: ['LiteLLM', 'Sandbox Execution', 'ReAct Loop', 'Intended Eval Plan'],
      evalBadge: 'Triggers Fallback "Intended Eval Plan"',
      evalBadgeType: 'warning',
      loc: '~130 LOC',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Welcome Message for First-Time Users */}
      <WelcomeGuide
        onSelectSample={onSelectRepo}
        onOpenUpload={onOpenCustomModal}
      />

      {/* Step Header */}
      <div className="flex items-center justify-between border-b border-[#262f3d] pb-3">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>Step 1: Select a Local Project Folder or Sample Codebase</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Choose Your Generative AI Codebase
          </h2>
        </div>
        <p className="text-xs text-zinc-400 hidden md:block max-w-md text-right">
          Deterministic AST filters bloat (<code className="text-cyan-400 font-mono">.git, venvs, binaries</code>) and maps prompts & execution flows.
        </p>
      </div>

      {/* Codebase Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sampleOptions.map((opt) => {
          const isSelected = selectedRepo === opt.id && !customFiles;
          return (
            <div
              key={opt.id}
              onClick={() => onSelectRepo(opt.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#151c28] border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                  : 'bg-[#111620] border-[#262f3d] hover:bg-[#161c28] hover:border-zinc-600'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                    {opt.category}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">{opt.loc}</span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-zinc-100">{opt.title}</h3>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-cyan-500 border-cyan-500 text-black'
                        : 'border-[#30363d] bg-[#161b22]'
                    }`}
                  >
                    {isSelected && <span className="text-xs font-bold">✓</span>}
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">{opt.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {opt.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1c212b] text-zinc-300 border border-[#30363d]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Eval status + files preview */}
              <div className="pt-4 mt-4 border-t border-[#21262d] flex items-center justify-between text-xs font-mono">
                <span
                  className={`flex items-center gap-1.5 text-[11px] ${
                    opt.evalBadgeType === 'success' ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {opt.evalBadgeType === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  <span>{opt.evalBadge}</span>
                </span>
                <span className="text-zinc-500 text-[11px]">{opt.files.length} files</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Option 3: Custom Codebase Card */}
      <div
        onClick={onOpenCustomModal}
        className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          customFiles
            ? 'bg-[#151c28] border-cyan-500 shadow-xl shadow-cyan-500/10'
            : 'bg-[#111620] border-[#262f3d] hover:bg-[#161c28] hover:border-zinc-600'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-zinc-100">Upload or Paste Custom Python Codebase</h3>
              {customFiles && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  {customFiles.length} custom files loaded
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Provide your own Python files or directory. The AST parser will inspect your custom prompts, classes, functions, and imports.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenCustomModal();
          }}
          className="px-3.5 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-zinc-200 text-xs font-mono border border-[#30363d] transition-colors shrink-0"
        >
          {customFiles ? 'Edit Custom Files' : 'Upload Files (.py)'}
        </button>
      </div>

      {/* Selected Codebase Details Box */}
      <div className="p-4 bg-[#111620] border border-[#21262d] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileCode className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="text-xs font-mono text-zinc-400">Selected Target:</div>
            <div className="font-semibold text-sm text-zinc-100">
              {customFiles
                ? `Custom Repository (${customFiles.length} files)`
                : selectedRepo === 'agentic_rag'
                ? 'Sample Repo: ./sample_repos/agentic_rag (LangGraph + Chroma)'
                : 'Sample Repo: ./sample_repos/code_agent_lite (LiteLLM + Sandbox)'}
            </div>
          </div>
        </div>

        {/* Gemini Enhancement Toggle */}
        <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 bg-[#161b22] px-3 py-1.5 rounded-lg border border-[#30363d] hover:border-zinc-600 transition-colors">
          <input
            type="checkbox"
            checked={useGemini}
            onChange={(e) => setUseGemini(e.target.checked)}
            className="rounded border-zinc-700 text-cyan-500 focus:ring-0 cursor-pointer"
          />
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Enable Gemini 3.8 Flash Synthesis
          </span>
        </label>
      </div>

      {/* Big Action CTA */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onStartAnalysis}
          disabled={isAnalyzing}
          className="w-full sm:w-auto min-w-[280px] flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 text-white font-semibold text-sm rounded-2xl shadow-xl shadow-cyan-600/25 disabled:opacity-50 transition-all cursor-pointer"
        >
          <Cpu className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analyzing Codebase...' : 'Analyze Codebase'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
