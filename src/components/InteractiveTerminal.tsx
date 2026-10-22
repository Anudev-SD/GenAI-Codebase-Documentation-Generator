import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Copy, Check, RotateCcw, Sparkles } from 'lucide-react';

interface InteractiveTerminalProps {
  onRunPipeline?: () => void;
  selectedRepo: string;
}

export const InteractiveTerminal: React.FC<InteractiveTerminalProps> = ({ onRunPipeline, selectedRepo }) => {
  const [inputCommand, setInputCommand] = useState<string>('docugen scan ./sample_repos/agentic_rag');
  const [history, setHistory] = useState<Array<{ cmd: string; output: string; time: string }>>([
    {
      cmd: 'docugen --help',
      output: `
Usage: docugen [OPTIONS] COMMAND [ARGS]...

Options:
  --help  Show this message and exit.

Commands:
  scan              Deterministic AST scan: extracts prompts, frameworks, bloat stats.
  generate          Run multi-agent pipeline: creates README.md, ARCHITECTURE.md, Mermaid.
  validate-mermaid  Validation loop: checks Mermaid.js syntax & executes auto-repairs.
  eval-audit        Extracts benchmark metrics or synthesizes Intended Evaluation Plan.
`,
      time: '01:35:00',
    },
  ]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const runCommand = async (cmdToRun: string) => {
    if (!cmdToRun.trim() || isRunning) return;
    setIsRunning(true);

    try {
      const parts = cmdToRun.trim().split(' ');
      const baseCmd = parts[0];
      const args = parts.slice(1).join(' ');

      const res = await fetch('/api/cli/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: baseCmd, args }),
      });
      const data = await res.json();

      setHistory(prev => [
        ...prev,
        {
          cmd: cmdToRun,
          output: data.output || 'Command executed.',
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err: any) {
      setHistory(prev => [
        ...prev,
        {
          cmd: cmdToRun,
          output: `\x1b[31mError: ${err.message}\x1b[0m`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(inputCommand);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const presetCommands = [
    { label: '🔍 scan', cmd: `docugen scan ./sample_repos/${selectedRepo}` },
    { label: '🚀 generate', cmd: `docugen generate ./sample_repos/${selectedRepo} --validate-mermaid` },
    { label: '📊 eval-audit', cmd: `docugen eval-audit ./sample_repos/${selectedRepo}` },
    { label: '📐 validate-mermaid', cmd: 'docugen validate-mermaid --file ./sample_repos/agentic_rag/architecture.mmd' },
    { label: '❓ --help', cmd: 'docugen --help' },
  ];

  // Helper to convert ANSI codes to clean styled spans
  const formatAnsi = (text: string) => {
    // Simple ANSI color parser
    const clean = text
      .replace(/\x1b\[1;36m/g, '<span class="text-cyan-400 font-bold">')
      .replace(/\x1b\[1;32m/g, '<span class="text-emerald-400 font-bold">')
      .replace(/\x1b\[1;35m/g, '<span class="text-fuchsia-400 font-bold">')
      .replace(/\x1b\[1;34m/g, '<span class="text-blue-400 font-bold">')
      .replace(/\x1b\[1;37m/g, '<span class="text-white font-bold">')
      .replace(/\x1b\[32m/g, '<span class="text-emerald-400">')
      .replace(/\x1b\[33m/g, '<span class="text-amber-400">')
      .replace(/\x1b\[35m/g, '<span class="text-purple-400">')
      .replace(/\x1b\[36m/g, '<span class="text-cyan-300">')
      .replace(/\x1b\[31m/g, '<span class="text-rose-400">')
      .replace(/\x1b\[90m/g, '<span class="text-zinc-500">')
      .replace(/\x1b\[1m/g, '<span class="font-bold text-zinc-100">')
      .replace(/\x1b\[0m/g, '</span>');

    return clean;
  };

  return (
    <div className="bg-[#0b0e14] border border-[#30363d] rounded-xl flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
            <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-200 font-semibold">docugen-cli</span>
            <span className="text-zinc-500">─ bash (Typer & Pydantic v2)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistory([])}
            className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-[#21262d] transition-colors"
            title="Clear Terminal Output"
          >
            <RotateCcw className="w-3 h-3" /> Clear
          </button>
        </div>
      </div>

      {/* Preset Command Buttons */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#12161f] border-b border-[#21262d] overflow-x-auto text-xs">
        <span className="text-[11px] font-mono text-zinc-500 shrink-0">Quick Run:</span>
        {presetCommands.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputCommand(preset.cmd);
              runCommand(preset.cmd);
            }}
            className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-[#1c212b] hover:bg-[#28303f] text-zinc-300 border border-[#30363d] hover:border-cyan-500/40 transition-all shrink-0 active:scale-95"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-[12.5px] leading-relaxed text-zinc-300 space-y-4">
        {history.map((item, idx) => (
          <div key={idx} className="group relative">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1 border-b border-[#21262d]/50 pb-0.5">
              <span className="text-cyan-400 font-semibold">$ {item.cmd}</span>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>{item.time}</span>
                <button
                  onClick={() => handleCopy(item.output.replace(/\x1b\[[0-9;]*m/g, ''), idx)}
                  className="p-1 hover:bg-[#21262d] rounded text-zinc-400 hover:text-zinc-200"
                  title="Copy output"
                >
                  {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <pre
              className="whitespace-pre-wrap font-mono text-[12px] bg-transparent p-0 m-0 text-zinc-300"
              dangerouslySetInnerHTML={{ __html: formatAnsi(item.output) }}
            />
          </div>
        ))}

        {isRunning && (
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono py-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Executing CLI agent state machine...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Input Bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2.5 bg-[#161b22] border-t border-[#30363d]">
        <span className="font-mono text-cyan-400 font-bold pl-2 text-sm">$</span>
        <input
          type="text"
          value={inputCommand}
          onChange={(e) => setInputCommand(e.target.value)}
          placeholder="e.g. docugen scan ./sample_repos/agentic_rag"
          className="flex-1 bg-transparent font-mono text-xs text-zinc-100 focus:outline-none placeholder:text-zinc-600"
        />
        <button
          type="submit"
          disabled={isRunning || !inputCommand.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono text-xs rounded-lg font-medium transition-colors"
        >
          <Play className="w-3 h-3" />
          <span>Execute</span>
        </button>
      </form>
    </div>
  );
};
