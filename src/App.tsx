/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Terminal as TerminalIcon,
  Cpu,
  Upload,
  BookOpen,
  HelpCircle,
  LayoutDashboard,
} from 'lucide-react';

import { PhaseStepper, WorkflowPhase } from './components/PhaseStepper';
import { CodebaseSummaryDashboard } from './components/CodebaseSummaryDashboard';
import { CodebaseSelectionView } from './components/CodebaseSelectionView';
import { AnalysisProgressView } from './components/AnalysisProgressView';
import { ResultsDocumentationView } from './components/ResultsDocumentationView';
import { CustomCodeModal } from './components/CustomCodeModal';

export default function App() {
  // Default view is 'dashboard' as requested by the user
  const [currentPhase, setCurrentPhase] = useState<WorkflowPhase>('dashboard');
  const [selectedRepo, setSelectedRepo] = useState<string>('agentic_rag');
  const [isPipelineRunning, setIsPipelineRunning] = useState<boolean>(false);
  const [useGeminiEnhancement, setUseGeminiEnhancement] = useState<boolean>(false);
  const [pipelineState, setPipelineState] = useState<any>(null);
  const [customFiles, setCustomFiles] = useState<any[] | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [docInitialTab, setDocInitialTab] = useState<'readme' | 'architecture' | 'raw' | 'env'>('readme');
  const [resultsInitialTab, setResultsInitialTab] = useState<'docs' | 'diagram' | 'env'>('docs');

  // Warm up initial analysis on mount so the default Dashboard view is rich with developer telemetry
  useEffect(() => {
    executePipeline(selectedRepo, null, false);
  }, []);

  const executePipeline = async (
    repoId: string,
    filesToUse: any[] | null = customFiles,
    showAnalysisStep: boolean = true
  ) => {
    setIsPipelineRunning(true);
    setNotification('Executing multi-agent AST ingestion pipeline...');

    if (showAnalysisStep) {
      setCurrentPhase('analysis');
    }

    try {
      const res = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoId: filesToUse ? 'custom' : repoId,
          customFiles: filesToUse,
          useGemini: useGeminiEnhancement,
        }),
      });

      const data = await res.json();
      if (data.success && data.state) {
        setPipelineState(data.state);
        setNotification('Analysis complete: Codebase summary dashboard updated!');
        // Set dashboard as default view when analysis finishes
        setCurrentPhase('dashboard');
      } else {
        setNotification('Pipeline error: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('Failed to execute pipeline:', err);
      setNotification('Failed to connect to backend server');
    } finally {
      setIsPipelineRunning(false);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const handleStartAnalysis = () => {
    executePipeline(selectedRepo, customFiles, true);
  };

  const handleRepoChange = (repoId: string) => {
    setSelectedRepo(repoId);
    setCustomFiles(null);
  };

  const handleCustomSubmit = (files: any[]) => {
    setCustomFiles(files);
    setSelectedRepo('custom');
    executePipeline('custom', files, true);
  };

  const handleNavigateToDocs = (target?: 'readme' | 'architecture' | 'diagram' | 'env') => {
    if (target === 'diagram') {
      setResultsInitialTab('diagram');
    } else {
      setResultsInitialTab('docs');
      setDocInitialTab(target || 'readme');
    }
    setCurrentPhase('results');
  };

  const selectedRepoTitle = customFiles
    ? `Custom Repository (${customFiles.length} files)`
    : selectedRepo === 'agentic_rag'
    ? 'Agentic RAG with LangGraph, ChromaDB & Tavily'
    : 'Autonomous Code Agent with LiteLLM & Code Sandbox';

  return (
    <div className="min-h-screen bg-[#090d13] text-[#e6edf3] flex flex-col selection:bg-cyan-500/30">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-[#161b22] text-zinc-100 border border-cyan-500/40 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-mono animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>{notification}</span>
        </div>
      )}

      {/* Global Header */}
      <header className="sticky top-0 z-40 bg-[#0d1117]/95 backdrop-blur-md border-b border-[#30363d] px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPhase('dashboard')}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/10 cursor-pointer hover:opacity-90 transition-opacity"
            title="Go to Codebase Summary Dashboard"
          >
            <Cpu className="w-5 h-5 text-white" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">GenDocuAgent</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                Typer • Pydantic v2
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Generative AI Codebase Scanner & Documentation Pipeline
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPhase('select')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161b22] hover:bg-[#21262d] text-zinc-300 hover:text-cyan-400 rounded-lg border border-[#30363d] text-xs font-mono transition-colors"
            title="View first-time user guide & project structure"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161b22] hover:bg-[#21262d] text-zinc-300 rounded-lg border border-[#30363d] text-xs font-mono transition-colors"
            title="Upload or paste custom Python code"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Upload Code</span>
          </button>
        </div>
      </header>

      {/* Navigation Stepper with Dashboard as Default View */}
      <PhaseStepper
        currentPhase={currentPhase}
        onPhaseChange={(phase) => setCurrentPhase(phase)}
        canAccessAnalysis={!!pipelineState}
        canAccessResults={!!pipelineState?.documentation}
        hasAnalyzedCodebase={!!pipelineState?.ingestion}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 flex flex-col">
        {currentPhase === 'dashboard' && (
          <CodebaseSummaryDashboard
            pipelineState={pipelineState}
            selectedRepo={selectedRepo}
            onNavigateToDocs={handleNavigateToDocs}
            onNavigateToInspector={() => setCurrentPhase('analysis')}
            onNavigateToSelect={() => setCurrentPhase('select')}
            onReanalyze={handleStartAnalysis}
            isAnalyzing={isPipelineRunning}
          />
        )}

        {currentPhase === 'select' && (
          <CodebaseSelectionView
            selectedRepo={selectedRepo}
            onSelectRepo={handleRepoChange}
            onOpenCustomModal={() => setIsCustomModalOpen(true)}
            customFiles={customFiles}
            onStartAnalysis={handleStartAnalysis}
            isAnalyzing={isPipelineRunning}
            useGemini={useGeminiEnhancement}
            setUseGemini={setUseGeminiEnhancement}
          />
        )}

        {currentPhase === 'analysis' && (
          <AnalysisProgressView
            pipelineState={pipelineState}
            isAnalyzing={isPipelineRunning}
            onReanalyze={handleStartAnalysis}
            onBackToSelect={() => setCurrentPhase('select')}
            onProceedToDocs={() => handleNavigateToDocs('readme')}
            selectedRepoName={selectedRepoTitle}
          />
        )}

        {currentPhase === 'results' && (
          <ResultsDocumentationView
            pipelineState={pipelineState}
            selectedRepo={selectedRepo}
            onBackToComponents={() => setCurrentPhase('dashboard')}
            onSelectNewCodebase={() => setCurrentPhase('select')}
            initialResultsTab={resultsInitialTab}
            initialDocTab={docInitialTab}
            useGemini={useGeminiEnhancement}
            setUseGemini={setUseGeminiEnhancement}
            onUpdateDiagram={(newCode) => {
              setPipelineState((prev: any) => ({
                ...prev,
                mermaid: { ...prev?.mermaid, validated_code: newCode },
                documentation: { ...prev?.documentation, mermaid_diagram: newCode },
              }));
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#30363d] px-6 py-4 bg-[#0d1117] text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-2">
          <span>GenDocuAgent Engine</span>
          <span>•</span>
          <span className="font-mono text-zinc-400">Typer + Pydantic v2 + AST Ingestion</span>
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <span>Developer Summary Dashboard</span>
          <span>•</span>
          <span>Validated Mermaid.js Diagrams</span>
          <span>•</span>
          <span>GitHub Portfolio Ready</span>
        </div>
      </footer>

      {/* Custom Codebase Upload Modal */}
      <CustomCodeModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSubmit={handleCustomSubmit}
      />
    </div>
  );
}
