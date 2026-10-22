import React from 'react';
import {
  Cpu,
  Layers,
  Workflow,
  ShieldCheck,
  FileText,
  FileCode,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Download,
  Copy,
  ExternalLink,
  Lock,
  Flame,
  Sparkles,
  RotateCcw,
  BookOpen,
  FolderOpen,
  FolderGit2,
  HelpCircle,
  Wrench,
  Check,
} from 'lucide-react';
import JSZip from 'jszip';
import { MermaidViewer } from './MermaidViewer';

interface CodebaseSummaryDashboardProps {
  pipelineState: any;
  selectedRepo: string;
  onNavigateToDocs: (tab?: 'readme' | 'architecture' | 'diagram' | 'env') => void;
  onNavigateToInspector: (stageIdx?: number) => void;
  onNavigateToSelect: () => void;
  onReanalyze: () => void;
  isAnalyzing: boolean;
}

export const CodebaseSummaryDashboard: React.FC<CodebaseSummaryDashboardProps> = ({
  pipelineState,
  selectedRepo,
  onNavigateToDocs,
  onNavigateToInspector,
  onNavigateToSelect,
  onReanalyze,
  isAnalyzing,
}) => {
  const [isZipping, setIsZipping] = React.useState<boolean>(false);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  // If no codebase has been selected or analyzed yet, show the friendly welcome empty state
  if (!pipelineState || !pipelineState.ingestion) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-cyan-500/20 text-white">
          <FolderGit2 className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl font-extrabold text-white">No Codebase Analyzed Yet</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Welcome to GenDocuAgent! To generate portfolio-ready documentation, architecture specifications, and validated Mermaid diagrams, select a local project folder containing your Python code or try one of our curated sample repositories.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onNavigateToSelect}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-600/25 transition-all"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Select Local Project Folder</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 p-5 bg-[#111620] border border-[#21262d] rounded-2xl text-left max-w-2xl mx-auto space-y-3">
          <div className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Supported Generative AI Frameworks:</span>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono text-zinc-400">
            {['LangChain', 'LangGraph', 'LlamaIndex', 'LiteLLM', 'ChromaDB', 'Pinecone', 'Qdrant', 'Tavily Search', 'Ragas'].map((f, i) => (
              <span key={i} className="px-2.5 py-1 rounded-md bg-[#161b22] border border-[#30363d] text-zinc-300">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { ingestion, flow, env, evaluation, mermaid, documentation } = pipelineState;

  const handleDownloadZip = async () => {
    if (!documentation) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      zip.file('README.md', documentation.readme_markdown);
      zip.file('ARCHITECTURE.md', documentation.architecture_markdown);
      zip.file('architecture.mmd', documentation.mermaid_diagram);
      zip.file('.env.example', documentation.env_example);

      try {
        const res = await fetch('/api/python-package');
        const data = await res.json();
        if (data.success && data.files) {
          const cliFolder = zip.folder('python_cli');
          for (const f of data.files) {
            cliFolder?.file(f.path, f.content);
          }
        }
      } catch (e) {
        // Fallback
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(ingestion.project_name || 'genai_app').toLowerCase().replace(/\s+/g, '_')}_documentation_bundle.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-2">
      {/* Developer Executive Hero Banner */}
      <div className="bg-gradient-to-r from-[#111726] via-[#101928] to-[#0c1421] border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                Developer Codebase Summary Dashboard
              </span>
              <span className="text-xs font-mono text-zinc-500">
                Pattern: <span className="text-zinc-200 font-bold uppercase">{flow?.architecture_pattern?.replace('_', ' ') || 'RAG'}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{ingestion.project_name}</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-3xl leading-relaxed">
              {flow?.workflow_summary || 'State-machine orchestration with deterministic AST ingestion, vector search, and safe tool boundaries.'}
            </p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateToDocs('readme')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>View README.md</span>
            </button>

            <button
              onClick={() => onNavigateToDocs('architecture')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1c2436] hover:bg-[#253046] text-purple-300 rounded-xl text-xs font-semibold border border-purple-500/30 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ARCHITECTURE.md</span>
            </button>

            <button
              onClick={() => onNavigateToDocs('diagram')}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1c2436] hover:bg-[#253046] text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-500/30 transition-all"
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>Mermaid Diagram</span>
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isZipping ? 'Zipping...' : 'Download Suite (.zip)'}</span>
            </button>

            <button
              onClick={onNavigateToSelect}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#161b22] hover:bg-[#21262d] text-zinc-300 rounded-xl text-xs font-medium border border-[#30363d] transition-colors"
              title="Select another codebase"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Change Codebase</span>
            </button>
          </div>
        </div>

        {/* Status Indicators Pill Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-[#1f2a3f] text-xs">
          <div className="flex items-center gap-2 bg-[#0c121e]/80 p-2.5 rounded-xl border border-[#1e2a40]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="text-zinc-500 text-[10px] uppercase font-mono block">AST Ingestion</span>
              <span className="font-semibold text-zinc-200">{ingestion.stats.python_files_parsed} Python Files Parsed</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#0c121e]/80 p-2.5 rounded-xl border border-[#1e2a40]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="text-zinc-500 text-[10px] uppercase font-mono block">Mermaid Validation</span>
              <span className="font-semibold text-zinc-200">
                {mermaid?.is_valid ? '100% Valid Syntax' : 'Repairs Applied'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#0c121e]/80 p-2.5 rounded-xl border border-[#1e2a40]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="text-zinc-500 text-[10px] uppercase font-mono block">Secrets Audited</span>
              <span className="font-semibold text-zinc-200">{env?.required_vars?.length || 0} Required Keys</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#0c121e]/80 p-2.5 rounded-xl border border-[#1e2a40]">
            {evaluation?.is_fallback_plan ? (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <div className="truncate">
              <span className="text-zinc-500 text-[10px] uppercase font-mono block">Evaluation Status</span>
              <span className="font-semibold text-zinc-200">
                {evaluation?.is_fallback_plan ? 'Intended Plan Fallback' : 'Verified Ragas Metrics'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Developer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on desktop): Architecture, RAG Pipeline & Workflows */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identified RAG Pipelines & Agent Workflows */}
          <div className="bg-[#111620] border border-[#262f3d] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Identified RAG Pipelines & Agent Workflows
                </h3>
              </div>
              <button
                onClick={() => onNavigateToInspector(1)}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Deep Flow Trace</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Steps Flow Timeline */}
            <div className="space-y-3">
              {flow?.steps?.map((step: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-[#0b0e14] border border-[#1e2535] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-zinc-100 text-xs">{step.step_name}</span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {step.step_type}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-zinc-400">{step.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[10.5px] shrink-0 text-zinc-500">
                    <span className="bg-[#161b22] px-2 py-0.5 rounded text-zinc-400">
                      In: {step.inputs.join(', ')}
                    </span>
                    <span>→</span>
                    <span className="bg-[#161b22] px-2 py-0.5 rounded text-emerald-400">
                      Out: {step.outputs.join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* External Tool Calls */}
            {flow?.tools && flow.tools.length > 0 && (
              <div className="pt-2">
                <div className="text-xs font-semibold text-zinc-300 mb-2.5 flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>External Tools & Execution Sandboxes ({flow.tools.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {flow.tools.map((t: any, i: number) => (
                    <div key={i} className="bg-[#0b0e14] border border-[#1e2535] rounded-lg p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-200">{t.name}</span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {t.risk_level} Risk
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">{t.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Validated Mermaid Architecture Diagram Preview */}
          <div className="bg-[#111620] border border-[#262f3d] rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Validated Mermaid Architecture Diagram
                </h3>
              </div>
              <button
                onClick={() => onNavigateToDocs('diagram')}
                className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <span>Interactive Visual Studio</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {mermaid?.validated_code && (
              <MermaidViewer code={mermaid.validated_code} showControls={true} />
            )}
          </div>
        </div>

        {/* Right Column: AI Frameworks, Secrets, Documentation Artifacts */}
        <div className="space-y-6">
          {/* Documentation Suite Status Cards */}
          <div className="bg-[#111620] border border-[#262f3d] rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Documentation Suite Status
                </h3>
              </div>
            </div>

            <div className="space-y-2.5">
              <div
                onClick={() => onNavigateToDocs('readme')}
                className="group bg-[#0b0e14] border border-[#1e2535] hover:border-cyan-500/40 p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-xs font-semibold text-zinc-100 group-hover:text-cyan-300">
                      README.md
                    </div>
                    <div className="text-[10px] text-zinc-500">Hero, Badges, Components, Evals</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ready
                </span>
              </div>

              <div
                onClick={() => onNavigateToDocs('architecture')}
                className="group bg-[#0b0e14] border border-[#1e2535] hover:border-purple-500/40 p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-xs font-semibold text-zinc-100 group-hover:text-purple-300">
                      ARCHITECTURE.md
                    </div>
                    <div className="text-[10px] text-zinc-500">Topology, Failure Modes, Security</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ready
                </span>
              </div>

              <div
                onClick={() => onNavigateToDocs('diagram')}
                className="group bg-[#0b0e14] border border-[#1e2535] hover:border-emerald-500/40 p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Workflow className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-zinc-100 group-hover:text-emerald-300">
                      architecture.mmd
                    </div>
                    <div className="text-[10px] text-zinc-500">Verified Mermaid.js Flowchart</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Validated
                </span>
              </div>

              <div
                onClick={() => onNavigateToDocs('env')}
                className="group bg-[#0b0e14] border border-[#1e2535] hover:border-amber-500/40 p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-semibold text-zinc-100 group-hover:text-amber-300">
                      .env.example
                    </div>
                    <div className="text-[10px] text-zinc-500">Sanitized Credentials Template</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Generated
                </span>
              </div>
            </div>
          </div>

          {/* Detected AI Frameworks */}
          <div className="bg-[#111620] border border-[#262f3d] rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Detected AI Frameworks ({ingestion.frameworks.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigateToInspector(0)}
                className="text-xs font-mono text-purple-400 hover:text-purple-300"
              >
                AST Details
              </button>
            </div>

            <div className="space-y-2">
              {ingestion.frameworks.map((fw: any, i: number) => (
                <div key={i} className="bg-[#0b0e14] border border-[#1e2535] p-2.5 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-zinc-200">{fw.framework_name}</span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {fw.category}
                    </span>
                  </div>
                  <div className="text-[10.5px] font-mono text-zinc-400 truncate">
                    Symbols: <span className="text-zinc-300">{fw.imported_symbols.join(', ') || 'top-level'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Required Environment Variables */}
          <div className="bg-[#111620] border border-[#262f3d] rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Required Secrets ({env?.required_vars?.length || 0})
                </h3>
              </div>
              <button
                onClick={() => onNavigateToDocs('env')}
                className="text-xs font-mono text-rose-400 hover:text-rose-300"
              >
                .env.example
              </button>
            </div>

            <div className="space-y-2">
              {env?.required_vars?.map((v: any, i: number) => (
                <div key={i} className="bg-[#0b0e14] border border-[#1e2535] p-2.5 rounded-lg flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="font-mono text-cyan-400 font-bold text-xs block truncate">{v.name}</span>
                    <span className="text-[10px] text-zinc-500 truncate block">{v.service}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                    Required
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Python Modules & AST Summary */}
          <div className="bg-[#111620] border border-[#262f3d] rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Key Python Modules
                </h3>
              </div>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-zinc-400 pb-1 border-b border-[#1c2436] text-[11px]">
                <span>Files Ingested:</span>
                <span className="text-zinc-200 font-bold">{ingestion.stats.python_files_parsed}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400 pb-1 border-b border-[#1c2436] text-[11px]">
                <span>Total Code LOC:</span>
                <span className="text-emerald-400 font-bold">{ingestion.stats.total_loc}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400 pb-1 border-b border-[#1c2436] text-[11px]">
                <span>Bloat Filtered:</span>
                <span className="text-amber-400 font-bold">{ingestion.stats.ignored_bloat_files} files</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                <span>System Prompts:</span>
                <span className="text-cyan-400 font-bold">{ingestion.system_prompts.length} cataloged</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
