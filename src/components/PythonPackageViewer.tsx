import React, { useEffect, useState } from 'react';
import { Folder, FileCode, Copy, Check, Download, Terminal, CheckCircle2 } from 'lucide-react';

interface FileEntry {
  path: string;
  name: string;
  content: string;
  size: number;
}

export const PythonPackageViewer: React.FC = () => {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/python-package')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.files) {
          setFiles(data.files);
          const cliFile = data.files.find((f: FileEntry) => f.path.includes('cli.py')) || data.files[0];
          setSelectedFile(cliFile);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-xl flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-zinc-100 text-xs">Python CLI Codebase Architecture</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Typer • Pydantic v2
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#21262d] hover:bg-[#30363d] text-zinc-200 rounded text-xs transition-colors border border-[#30363d]"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy File'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* File tree sidebar */}
        <div className="w-full md:w-64 bg-[#12161f] border-r border-[#30363d] overflow-y-auto p-3 space-y-1">
          <div className="text-[11px] font-mono uppercase text-zinc-500 font-semibold px-2 py-1">
            Package Structure
          </div>

          {files.map((file, idx) => {
            const isSelected = selectedFile?.path === file.path;
            return (
              <button
                key={idx}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-xs font-mono transition-colors ${
                  isSelected
                    ? 'bg-[#1f6feb]/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1c212b]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                <span className="truncate">{file.path}</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-[#21262d] mt-4 px-2 space-y-2">
            <span className="text-[11px] font-mono text-zinc-400 font-semibold">Local CLI Install:</span>
            <pre className="text-[10px] font-mono bg-[#0b0e14] p-2 rounded text-emerald-400/90 leading-relaxed border border-[#30363d]">
              pip install -e ./python_cli{'\n'}
              docugen scan .{'\n'}
              docugen generate .
            </pre>
          </div>
        </div>

        {/* Code display */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#0d1117]">
          {selectedFile ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-[#21262d]">
                <span className="text-zinc-200 font-semibold">{selectedFile.path}</span>
                <span>{selectedFile.size} bytes</span>
              </div>
              <pre className="p-3 bg-[#161b22] border border-[#21262d] rounded-xl font-mono text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap overflow-x-auto">
                {selectedFile.content}
              </pre>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
              Select a file to inspect
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
