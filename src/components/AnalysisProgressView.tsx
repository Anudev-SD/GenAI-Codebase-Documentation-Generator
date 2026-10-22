import React, { useState } from 'react';
import {
  FileCode,
  Workflow,
  ShieldCheck,
  Flame,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Layers,
  Terminal,
  Cpu,
} from 'lucide-react';

import { StageAstIngestion } from './StageAstIngestion';
import { StageFlowTracer } from './StageFlowTracer';
import { StageEnvInferencer } from './StageEnvInferencer';
import { StageEvalExtractor } from './StageEvalExtractor';
import { StageMermaidValidator } from './StageMermaidValidator';

interface AnalysisProgressViewProps {
  pipelineState: any;
  isAnalyzing: boolean;
  onReanalyze: () => void;
  onBackToSelect: () => void;
  onProceedToDocs: () => void;
  selectedRepoName: string;
}

export const AnalysisProgressView: React.FC<AnalysisProgressViewProps> = ({
  pipelineState,
  isAnalyzing,
  onReanalyze,
  onBackToSelect,
  onProceedToDocs,
  selectedRepoName,
}) => {
  const [activeStageTab, setActiveStageTab] = useState<number>(0);

  const stages = [
    { title: 'AST Ingestion', subtitle: 'Bloat filters & prompts', icon: FileCode },
    { title: 'Flow Tracer', subtitle: 'StateGraph & loops', icon: Workflow },
    { title: 'Env Inferencer', subtitle: 'Secrets & .env', icon: ShieldCheck },
    { title: 'Eval Auditor', subtitle: 'Ragas / Intended Plan', icon: Flame },
    { title: 'Mermaid Validator', subtitle: 'Cyclic syntax repair', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      {/* Header Banner */}
      <div className="bg-[#111620] border border-[#262f3d] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#21262d]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 2: Analysis Progress & Detected AI Components</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{selectedRepoName}</span>
              {isAnalyzing ? (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 font-normal">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Running Agents...
                </span>
              ) : (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-normal">
                  <CheckCircle2 className="w-3 h-3" /> Analysis Complete
                </span>
              )}
            </h2>
            <p className="text-xs text-zinc-400">
              Review detected system prompts, execution loops, inferred secrets, and evaluation metrics before viewing the generated documentation bundle.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onBackToSelect}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161b22] hover:bg-[#21262d] text-zinc-300 rounded-lg text-xs font-medium border border-[#30363d] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Codebase</span>
            </button>
            <button
              onClick={onReanalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161b22] hover:bg-[#21262d] text-zinc-300 rounded-lg text-xs font-medium border border-[#30363d] transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>Re-run</span>
            </button>
          </div>
        </div>

        {/* 5-Stage Stepper Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-4">
          {stages.map((stg, idx) => {
            const Icon = stg.icon;
            const isActive = activeStageTab === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveStageTab(idx)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1b2230] border-cyan-500 shadow-md shadow-cyan-500/10'
                    : 'bg-[#161b22]/50 border-[#262f3d] hover:bg-[#161b22] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold">STAGE 0{idx + 1}</span>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-zinc-500'}`} />
                </div>
                <div className={`text-xs font-semibold ${isActive ? 'text-cyan-300' : 'text-zinc-200'}`}>
                  {stg.title}
                </div>
                <div className="text-[10px] text-zinc-500 truncate">{stg.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Inspection Content */}
      <div className="bg-[#111620] border border-[#262f3d] rounded-2xl p-6 min-h-[420px]">
        {activeStageTab === 0 && <StageAstIngestion ingestion={pipelineState?.ingestion} />}
        {activeStageTab === 1 && <StageFlowTracer flow={pipelineState?.flow} />}
        {activeStageTab === 2 && <StageEnvInferencer env={pipelineState?.env} />}
        {activeStageTab === 3 && <StageEvalExtractor evaluation={pipelineState?.evaluation} />}
        {activeStageTab === 4 && <StageMermaidValidator mermaid={pipelineState?.mermaid} />}
      </div>

      {/* Bottom Action Transition to Step 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#111620] border border-[#262f3d] rounded-2xl">
        <div className="text-xs text-zinc-400 font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>All 5 pipeline agent steps validated with strict Pydantic schemas.</span>
        </div>

        <button
          onClick={onProceedToDocs}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
        >
          <span>View Generated Documentation & Diagrams</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
