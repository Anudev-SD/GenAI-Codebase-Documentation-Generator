import React, { useState } from 'react';
import { marked } from 'marked';
import JSZip from 'jszip';
import { Download, Copy, Check, FileText, Code, ShieldCheck, Share2, Sparkles, BookOpen } from 'lucide-react';
import { MermaidViewer } from './MermaidViewer';

interface DocumentationViewerProps {
  readme: string;
  architecture: string;
  mermaidCode: string;
  dotenv: string;
  projectName: string;
  initialTab?: 'readme' | 'architecture' | 'raw' | 'env';
}

export const DocumentationViewer: React.FC<DocumentationViewerProps> = ({
  readme,
  architecture,
  mermaidCode,
  dotenv,
  projectName,
  initialTab = 'readme',
}) => {
  const [activeTab, setActiveTab] = useState<'readme' | 'architecture' | 'raw' | 'env'>(initialTab);
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const getCleanMarkdownWithoutMermaid = (markdown: string) => {
    // Strip mermaid block so we can render Mermaid natively via MermaidViewer
    return markdown.replace(/```mermaid[\s\S]*?```/g, '<div id="mermaid-placeholder"></div>');
  };

  const handleCopy = () => {
    const textToCopy = activeTab === 'readme' ? readme : (activeTab === 'architecture' ? architecture : (activeTab === 'env' ? dotenv : readme));
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      zip.file('README.md', readme);
      zip.file('ARCHITECTURE.md', architecture);
      zip.file('architecture.mmd', mermaidCode);
      zip.file('.env.example', dotenv);

      // Fetch python CLI files from backend
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
        // Fallback to docs only
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_docs_bundle.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-xl flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] gap-2">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-lg border border-[#30363d]">
          <button
            onClick={() => setActiveTab('readme')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'readme'
                ? 'bg-[#1f6feb] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#161b22]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>README.md</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'architecture'
                ? 'bg-[#1f6feb] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#161b22]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ARCHITECTURE.md</span>
          </button>
          <button
            onClick={() => setActiveTab('env')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'env'
                ? 'bg-[#1f6feb] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#161b22]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>.env.example</span>
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'raw'
                ? 'bg-[#1f6feb] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#161b22]'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Raw Markdown</span>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-zinc-200 rounded-lg text-xs font-medium transition-colors border border-[#30363d]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy File'}</span>
          </button>
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-medium transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isZipping ? 'Packaging...' : 'Download Docs (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'readme' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Top Architecture Diagram Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> Dynamic Architecture Diagram
                </h3>
                <span className="text-xs text-zinc-500 font-mono">Validated Mermaid.js flow</span>
              </div>
              <MermaidViewer code={mermaidCode} />
            </div>

            {/* Rendered HTML Markdown */}
            <div
              className="markdown-body p-6 bg-[#161b22]/40 rounded-xl border border-[#30363d]"
              dangerouslySetInnerHTML={{
                __html: marked.parse(getCleanMarkdownWithoutMermaid(readme)) as string,
              }}
            />
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" /> Architecture Topology & Verification
              </h3>
              <MermaidViewer code={mermaidCode} />
            </div>

            <div
              className="markdown-body p-6 bg-[#161b22]/40 rounded-xl border border-[#30363d]"
              dangerouslySetInnerHTML={{
                __html: marked.parse(getCleanMarkdownWithoutMermaid(architecture)) as string,
              }}
            />
          </div>
        )}

        {activeTab === 'env' && (
          <div className="max-w-3xl mx-auto">
            <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl font-mono text-xs text-zinc-200">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#30363d] text-zinc-400">
                <span className="font-semibold text-emerald-400 font-mono">.env.example Blueprint</span>
                <span className="text-[11px]">Ready to copy to local root</span>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed text-emerald-300/90 font-mono">
                {dotenv}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="max-w-4xl mx-auto">
            <pre className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {readme}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
