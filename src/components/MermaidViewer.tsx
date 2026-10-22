import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { CheckCircle2, AlertTriangle, RefreshCw, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MermaidViewerProps {
  code: string;
  className?: string;
  showControls?: boolean;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ code, className = '', showControls = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [isRendering, setIsRendering] = useState<boolean>(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#0d1117',
        primaryColor: '#3b82f6',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#1d4ed8',
        lineColor: '#60a5fa',
        secondaryColor: '#10b981',
        tertiaryColor: '#8b5cf6',
        fontSize: '13px',
        fontFamily: 'JetBrains Mono, -apple-system, sans-serif',
      },
      securityLevel: 'loose',
    });
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const renderDiagram = async () => {
      if (!code.trim()) {
        setSvgContent('');
        return;
      }

      setIsRendering(true);
      setError(null);
      const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

      try {
        const { svg } = await mermaid.render(uniqueId, code);
        if (!isCancelled) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.warn('Mermaid rendering issue:', err);
          setError(err?.message || 'Invalid Mermaid syntax or token error');
        }
      } finally {
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    };

    renderDiagram();

    return () => {
      isCancelled = true;
    };
  }, [code]);

  return (
    <div className={`relative bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden flex flex-col ${className}`}>
      {showControls && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363d] bg-[#161b22]/70 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-zinc-300 font-medium">Mermaid.js Flowchart</span>
            {error ? (
              <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 text-[11px]">
                <AlertTriangle className="w-3 h-3" /> Syntax Repair Needed
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20 text-[11px]">
                <CheckCircle2 className="w-3 h-3" /> Syntax Validated
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 bg-[#21262d] rounded-lg p-0.5">
            <button
              onClick={() => setZoom(prev => Math.max(0.6, prev - 0.15))}
              className="p-1 hover:bg-[#30363d] rounded text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] font-mono text-zinc-400 min-w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(prev => Math.min(2.0, prev + 0.15))}
              className="p-1 hover:bg-[#30363d] rounded text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 hover:bg-[#30363d] rounded text-zinc-400 hover:text-zinc-200 transition-colors ml-1 border-l border-[#30363d] pl-1.5"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[280px]">
        {isRendering ? (
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            Rendering architecture diagram...
          </div>
        ) : error ? (
          <div className="max-w-md p-4 bg-amber-950/30 border border-amber-800/40 rounded-lg text-amber-200 text-xs">
            <div className="flex items-center gap-2 font-semibold mb-1 text-amber-400">
              <AlertTriangle className="w-4 h-4" /> Mermaid Parse Warning
            </div>
            <p className="font-mono text-[11px] opacity-80 break-words mb-2">{error}</p>
            <p className="text-[11px] text-zinc-400">The validator agent will auto-sanitize node declarations during pipeline generation.</p>
          </div>
        ) : (
          <div
            ref={containerRef}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.15s ease' }}
            className="flex items-center justify-center w-full"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  );
};
