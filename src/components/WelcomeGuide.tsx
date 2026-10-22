import React, { useState } from 'react';
import {
  Sparkles,
  HelpCircle,
  FolderGit2,
  Cpu,
  Workflow,
  Lock,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  FileCode,
  Info,
  Layers,
  ArrowRight,
  Terminal,
} from 'lucide-react';

interface WelcomeGuideProps {
  onDismiss?: () => void;
  onSelectSample?: (sampleId: string) => void;
  onOpenUpload?: () => void;
}

export const WelcomeGuide: React.FC<WelcomeGuideProps> = ({
  onDismiss,
  onSelectSample,
  onOpenUpload,
}) => {
  const [showStructureExample, setShowStructureExample] = useState<boolean>(true);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  if (isDismissed) {
    return (
      <div className="flex justify-end">
        <button
          onClick={() => setIsDismissed(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Show Getting Started Guide</span>
        </button>
      </div>
    );
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#131b2a] via-[#101724] to-[#0d131f] border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-cyan-950/20 space-y-5">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Welcome to GenDocuAgent</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Turn Any Local Generative AI Codebase into Portfolio-Ready Documentation
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
            GenDocuAgent uses a deterministic Python AST parser and a multi-agent state pipeline to scan your local Generative AI projects, extract system prompts, trace agent loops, and auto-generate clean <strong>README.md</strong>, <strong>ARCHITECTURE.md</strong>, and verified <strong>Mermaid diagrams</strong>.
          </p>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-[#1f2838] transition-colors shrink-0"
          title="Dismiss welcome guide"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-[#151d2d]/80 border border-[#232f45] rounded-xl p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>AI Framework Detection</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-normal">
            Automatically identifies LangChain, LangGraph, LlamaIndex, LiteLLM, ChromaDB, Pinecone, and vector stores without executing untrusted code.
          </p>
        </div>

        <div className="bg-[#151d2d]/80 border border-[#232f45] rounded-xl p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
            <Workflow className="w-4 h-4 text-purple-400" />
            <span>RAG & Agent Loop Analysis</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-normal">
            Traces intent routers, vector retrieval flows, self-corrective retry loops, and isolated tool calls (sandboxes, web search).
          </p>
        </div>

        <div className="bg-[#151d2d]/80 border border-[#232f45] rounded-xl p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Environment Variable Identification</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-normal">
            Detects runtime <code className="text-zinc-200">os.getenv</code> lookups and maps required API keys to a sanitized <code className="text-zinc-200">.env.example</code>.
          </p>
        </div>

        <div className="bg-[#151d2d]/80 border border-[#232f45] rounded-xl p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>README & Architecture Docs</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-normal">
            Assembles hero sections, tech badges, component deep dives, system prompt catalogs, quickstart bash scripts, and threat models.
          </p>
        </div>

        <div className="bg-[#151d2d]/80 border border-[#232f45] rounded-xl p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-fuchsia-400 font-semibold text-xs">
            <Cpu className="w-4 h-4 text-fuchsia-400" />
            <span>Validated Mermaid Diagrams</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-normal">
            Syntax-checks and auto-repairs Mermaid flowcharts in a cyclic validation loop to guarantee error-free rendering on GitHub.
          </p>
        </div>

        <div className="bg-[#151d2d]/80 border border-[#232f45] rounded-xl p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>Evaluation Plan Fallback</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-normal">
            Extracts real Ragas/TruLens benchmark logs, or automatically synthesizes an <em>Intended Evaluation Plan</em> if logs are missing.
          </p>
        </div>
      </div>

      {/* How to Start Guide Banner */}
      <div className="bg-[#162030] border border-[#283852] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-[11px] font-bold">1</span>
            <span>How to Start in 2 Simple Steps:</span>
          </div>
          <p className="text-xs text-zinc-300">
            <strong>1. Select a Codebase:</strong> Choose one of our pre-built sample repositories below, or click <em>Upload Files</em> to select a local folder containing your Python scripts.
            <br />
            <strong>2. Click Analyze Codebase:</strong> Press the <strong>"Analyze Codebase"</strong> button to run AST ingestion and view the step-by-step progress.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onSelectSample?.('agentic_rag')}
            className="px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition-colors"
          >
            Try Agentic RAG Sample
          </button>
        </div>
      </div>

      {/* Expandable "Don't have a project folder ready?" Section */}
      <div className="border border-[#232f45] rounded-xl bg-[#0f1523] overflow-hidden">
        <button
          onClick={() => setShowStructureExample(!showStructureExample)}
          className="w-full flex items-center justify-between p-3.5 text-xs text-zinc-300 hover:text-white hover:bg-[#141c2c] transition-colors"
        >
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-zinc-200">
              Don't have a project folder ready? Here is what to prepare & an example structure:
            </span>
          </div>
          <div className="flex items-center gap-1 text-zinc-400 text-[11px] font-mono">
            <span>{showStructureExample ? 'Hide Structure' : 'Show Beginner Example'}</span>
            {showStructureExample ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {showStructureExample && (
          <div className="p-4 pt-1 border-t border-[#1c2638] space-y-3 text-xs text-zinc-300">
            <p className="text-zinc-400 leading-relaxed text-[11.5px]">
              You don't need a complex setup! Even a repository with just one or two Python files (<code className="text-cyan-400 font-mono">.py</code>) using an LLM library is completely valid. Here is a recommended, beginner-friendly layout:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* File tree */}
              <div className="bg-[#090d15] border border-[#212c3f] rounded-lg p-3 font-mono text-[11.5px] leading-relaxed text-zinc-300">
                <div className="text-zinc-500 text-[10px] mb-1 font-semibold uppercase tracking-wider">Example Project Structure</div>
                <div className="text-cyan-400 font-bold">my-genai-app/</div>
                <div className="text-zinc-400">├── <span className="text-zinc-200">main.py</span>            <span className="text-zinc-500"># Entrypoint & CLI invocation</span></div>
                <div className="text-zinc-400">├── <span className="text-zinc-200">graph.py</span>           <span className="text-zinc-500"># StateGraph router or agent loop</span></div>
                <div className="text-zinc-400">├── <span className="text-zinc-200">retriever.py</span>       <span className="text-zinc-500"># Vector store query & chunk retrieval</span></div>
                <div className="text-zinc-400">├── <span className="text-zinc-200">prompts.py</span>         <span className="text-zinc-500"># System prompts & persona definitions</span></div>
                <div className="text-zinc-400">├── <span className="text-amber-400">eval_results.json</span>  <span className="text-zinc-500"># (Optional) Ragas or TruLens metrics</span></div>
                <div className="text-zinc-400">└── <span className="text-zinc-200">requirements.txt</span>  <span className="text-zinc-500"># Dependencies (langgraph, chromadb...)</span></div>
              </div>

              {/* What each file contains */}
              <div className="space-y-1.5 text-[11.5px] text-zinc-400">
                <div className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-mono">•</span>
                  <span><strong className="text-zinc-200">Python Files (.py):</strong> Define your functions, classes, and system prompt strings (e.g. <code className="text-zinc-300 font-mono">SYSTEM_PROMPT = """You are..."""</code>).</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-purple-400 font-mono">•</span>
                  <span><strong className="text-zinc-200">Imports:</strong> Import your frameworks (e.g. <code className="text-zinc-300 font-mono">from langgraph.graph import StateGraph</code> or <code className="text-zinc-300 font-mono">import chromadb</code>).</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-mono">•</span>
                  <span><strong className="text-zinc-200">Environment Lookups:</strong> Use <code className="text-zinc-300 font-mono">os.getenv("OPENAI_API_KEY")</code> so the agent can discover your credentials.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-mono">•</span>
                  <span><strong className="text-zinc-200">No eval logs? No problem:</strong> If you don't have an <code className="text-zinc-300 font-mono">eval_results.json</code>, the app automatically generates an <em>Intended Evaluation Plan</em> with target metrics!</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-zinc-500">
                Tip: You can click "Upload Files (.py)" below to paste code directly or drop any folder.
              </span>
              <button
                onClick={handleDismiss}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-mono"
              >
                Ready to proceed? Got it!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
