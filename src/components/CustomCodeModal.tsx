import React, { useState } from 'react';
import { X, Upload, FileCode, Plus, Trash2, Check } from 'lucide-react';

interface CustomCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (files: Array<{ path: string; name: string; content: string }>) => void;
}

export const CustomCodeModal: React.FC<CustomCodeModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [files, setFiles] = useState<Array<{ path: string; name: string; content: string }>>([
    {
      path: 'rag_agent.py',
      name: 'rag_agent.py',
      content: `import os
from langgraph.graph import StateGraph, END
from pinecone import Pinecone
from litellm import completion

SYSTEM_PROMPT = """You are an enterprise research assistant.
Reason step-by-step using retrieved technical documents.
Do not hallucinate facts outside the provided context."""

def main():
    api_key = os.getenv("PINECONE_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    print("Agent initialized with pinecone index.")
`,
    },
  ]);

  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [newFileName, setNewFileName] = useState<string>('');

  if (!isOpen) return null;

  const handleAddFile = () => {
    if (!newFileName.trim()) return;
    const name = newFileName.endsWith('.py') ? newFileName : `${newFileName}.py`;
    setFiles(prev => [...prev, { path: name, name, content: '# Python code snippet\n' }]);
    setActiveFileIndex(files.length);
    setNewFileName('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded) return;

    Array.from(uploaded).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFiles(prev => [...prev, { path: file.name, name: file.name, content }]);
      };
      reader.readAsText(file);
    });
  };

  const handleSaveAndRun = () => {
    onSubmit(files);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-3xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#30363d] bg-[#12161f]">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-zinc-100 text-sm">Custom Codebase Scanner</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#21262d] rounded-lg text-zinc-400 hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File sidebar */}
          <div className="w-full md:w-56 bg-[#0d1117] border-r border-[#30363d] p-3 flex flex-col gap-2">
            <div className="text-[11px] font-mono text-zinc-400 font-semibold uppercase">Files ({files.length})</div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {files.map((f, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveFileIndex(idx)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                    activeFileIndex === idx
                      ? 'bg-[#1f6feb]/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-zinc-400 hover:bg-[#161b22]'
                  }`}
                >
                  <span className="truncate">{f.name}</span>
                  {files.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFiles(prev => prev.filter((_, i) => i !== idx));
                        setActiveFileIndex(0);
                      }}
                      className="p-0.5 hover:text-rose-400 opacity-60 hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add file */}
            <div className="pt-2 border-t border-[#21262d] space-y-2">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="module.py"
                  className="w-full bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-xs font-mono text-zinc-200 focus:outline-none"
                />
                <button
                  onClick={handleAddFile}
                  className="p-1.5 bg-[#21262d] hover:bg-[#30363d] text-zinc-200 rounded text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Upload input */}
              <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#161b22] hover:bg-[#21262d] text-zinc-300 rounded border border-[#30363d] text-xs cursor-pointer font-mono">
                <Upload className="w-3.5 h-3.5" /> Upload .py
                <input type="file" multiple accept=".py" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 p-4 bg-[#0d1117] flex flex-col">
            <div className="text-xs font-mono text-zinc-400 mb-2">
              Editing: <span className="text-zinc-200 font-semibold">{files[activeFileIndex]?.name}</span>
            </div>
            <textarea
              value={files[activeFileIndex]?.content || ''}
              onChange={(e) => {
                const updated = [...files];
                updated[activeFileIndex].content = e.target.value;
                setFiles(updated);
              }}
              className="flex-1 w-full bg-[#161b22] border border-[#30363d] rounded-xl p-3 font-mono text-xs text-zinc-200 leading-relaxed focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#30363d] bg-[#12161f]">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#21262d] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAndRun}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-medium transition-all shadow-md active:scale-95"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Scan & Run Pipeline</span>
          </button>
        </div>
      </div>
    </div>
  );
};
