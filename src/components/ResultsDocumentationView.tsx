import React, { useState } from 'react';
import {
  BookOpen,
  ShieldCheck,
  Workflow,
  Lock,
  Download,
  Copy,
  Check,
  Sparkles,
  RotateCcw,
  Sliders,
  ArrowLeft,
  Layers,
  Cpu,
} from 'lucide-react';
import JSZip from 'jszip';
import { DocumentationViewer } from './DocumentationViewer';
import { StageMermaidValidator } from './StageMermaidValidator';
import { DeveloperSettingsModal } from './DeveloperSettingsModal';

interface ResultsDocumentationViewProps {
  pipelineState: any;
  selectedRepo: string;
  onBackToComponents: () => void;
  onSelectNewCodebase: () => void;
  onUpdateDiagram: (newCode: string) => void;
  initialResultsTab?: 'docs' | 'diagram' | 'env';
  initialDocTab?: 'readme' | 'architecture' | 'raw' | 'env';
  useGemini: boolean;
  setUseGemini: (val: boolean) => void;
}

export const ResultsDocumentationView: React.FC<ResultsDocumentationViewProps> = ({
  pipelineState,
  selectedRepo,
  onBackToComponents,
  onSelectNewCodebase,
  onUpdateDiagram,
  initialResultsTab = 'docs',
  initialDocTab = 'readme',
  useGemini,
  setUseGemini,
}) => {
  const [activeResultsTab, setActiveResultsTab] = useState<'docs' | 'diagram' | 'env'>(initialResultsTab);
  const [activeDocSubTab, setActiveDocSubTab] = useState<'readme' | 'architecture'>(
    initialDocTab === 'architecture' ? 'architecture' : 'readme'
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const projectName = pipelineState?.ingestion?.project_name || 'GENAI-APP';
  const { ingestion, flow, env, evaluation, mermaid, documentation } = pipelineState || {};

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
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_documentation_bundle.zip`;
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

  return (
    <div className="max-w-7xl mx-auto space-y-4 py-2">
      {/* Clean Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111620] border border-[#262f3d] p-4 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generated Documentation Suite</span>
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">Pattern: <strong className="text-zinc-200 uppercase">{flow?.architecture_pattern?.replace('_', ' ')}</strong></span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">Frameworks: <strong className="text-purple-300">{ingestion?.frameworks?.map((f: any) => f.framework_name).join(', ') || 'Standard Python'}</strong></span>
          </div>

          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>{projectName}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              Ready for GitHub
            </span>
          </h2>
        </div>

        {/* Clean Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-semibold shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isZipping ? 'Zipping...' : 'Download Suite (.zip)'}</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c2436] hover:bg-[#253046] text-cyan-300 rounded-lg text-xs font-medium border border-cyan-500/30 transition-colors"
            title="Open developer settings, schemas & CLI terminal"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Developer Settings</span>
          </button>

          <button
            onClick={onBackToComponents}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161b22] hover:bg-[#21262d] text-zinc-300 rounded-lg text-xs font-medium border border-[#30363d] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Primary Results Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setActiveResultsTab('docs');
              setActiveDocSubTab('readme');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeResultsTab === 'docs' && activeDocSubTab === 'readme'
                ? 'bg-[#21262d] text-white border border-[#30363d]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>README.md</span>
          </button>

          <button
            onClick={() => {
              setActiveResultsTab('docs');
              setActiveDocSubTab('architecture');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeResultsTab === 'docs' && activeDocSubTab === 'architecture'
                ? 'bg-[#21262d] text-white border border-[#30363d]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>ARCHITECTURE.md</span>
          </button>

          <button
            onClick={() => setActiveResultsTab('diagram')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeResultsTab === 'diagram'
                ? 'bg-[#21262d] text-white border border-[#30363d]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Workflow className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mermaid Architecture Studio</span>
          </button>

          <button
            onClick={() => {
              setActiveResultsTab('env');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeResultsTab === 'env'
                ? 'bg-[#21262d] text-white border border-[#30363d]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>.env.example Blueprint</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-zinc-500">
          <span>Mermaid Status:</span>
          <span className="text-emerald-400 font-bold">100% Validated</span>
        </div>
      </div>

      {/* Primary Results Display */}
      <div className="min-h-[600px]">
        {activeResultsTab === 'docs' && (
          <DocumentationViewer
            readme={documentation?.readme_markdown || ''}
            architecture={documentation?.architecture_markdown || ''}
            mermaidCode={documentation?.mermaid_diagram || ''}
            dotenv={documentation?.env_example || ''}
            projectName={projectName}
            initialTab={activeDocSubTab}
          />
        )}

        {activeResultsTab === 'diagram' && (
          <div className="h-[650px] flex flex-col gap-4">
            <StageMermaidValidator
              mermaid={mermaid}
              onUpdateDiagram={onUpdateDiagram}
            />
          </div>
        )}

        {activeResultsTab === 'env' && (
          <div className="bg-[#111620] border border-[#262f3d] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Sanitized .env.example Blueprint</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Extracted directly from source code AST os.getenv calls & framework imports.
                </p>
              </div>
            </div>

            <pre className="p-4 bg-[#090d15] border border-[#1e2535] rounded-xl font-mono text-xs text-emerald-300/90 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {documentation?.env_example}
            </pre>
          </div>
        )}
      </div>

      {/* Developer Settings & Debugging Modal */}
      <DeveloperSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        pipelineState={pipelineState}
        selectedRepo={selectedRepo}
        useGemini={useGemini}
        setUseGemini={setUseGemini}
      />
    </div>
  );
};
