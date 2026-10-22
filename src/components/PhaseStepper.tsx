import React from 'react';
import { LayoutDashboard, FolderGit2, Cpu, FileCheck2, ChevronRight } from 'lucide-react';

export type WorkflowPhase = 'dashboard' | 'select' | 'analysis' | 'results';

interface PhaseStepperProps {
  currentPhase: WorkflowPhase;
  onPhaseChange: (phase: WorkflowPhase) => void;
  canAccessAnalysis: boolean;
  canAccessResults: boolean;
  hasAnalyzedCodebase: boolean;
}

export const PhaseStepper: React.FC<PhaseStepperProps> = ({
  currentPhase,
  onPhaseChange,
  canAccessAnalysis,
  canAccessResults,
  hasAnalyzedCodebase,
}) => {
  const steps: Array<{
    id: WorkflowPhase;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    enabled: boolean;
  }> = [
    {
      id: 'dashboard',
      label: 'Summary Dashboard',
      sublabel: hasAnalyzedCodebase ? 'Frameworks, workflows & status' : 'Developer overview & welcome',
      icon: LayoutDashboard,
      enabled: true,
    },
    {
      id: 'select',
      label: 'Select Codebase',
      sublabel: 'Local folder or sample repo',
      icon: FolderGit2,
      enabled: true,
    },
    {
      id: 'analysis',
      label: 'Pipeline Inspector',
      sublabel: 'AST ingestion & agent traces',
      icon: Cpu,
      enabled: canAccessAnalysis,
    },
    {
      id: 'results',
      label: 'Generated Docs',
      sublabel: 'README, Architecture & Mermaid',
      icon: FileCheck2,
      enabled: canAccessResults,
    },
  ];

  return (
    <div className="w-full bg-[#111620] border-b border-[#21262d] px-4 lg:px-8 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-3 w-full">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = currentPhase === step.id;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => step.enabled && onPhaseChange(step.id)}
                  disabled={!step.enabled}
                  className={`flex-1 flex items-center gap-2.5 p-2 sm:px-3 sm:py-1.5 rounded-xl transition-all text-left ${
                    isCurrent
                      ? 'bg-cyan-500/15 border border-cyan-500/40 text-white shadow-sm ring-1 ring-cyan-500/20'
                      : step.enabled
                      ? 'text-zinc-300 hover:bg-[#161b22] hover:text-white cursor-pointer border border-transparent'
                      : 'text-zinc-600 opacity-50 cursor-not-allowed border border-transparent'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold font-mono transition-colors ${
                      isCurrent
                        ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                        : step.enabled
                        ? 'bg-[#1c212b] text-zinc-300'
                        : 'bg-[#141822] text-zinc-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="hidden md:block truncate">
                    <div className={`text-xs font-semibold ${isCurrent ? 'text-cyan-300' : 'text-zinc-200'}`}>
                      {step.label}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">{step.sublabel}</div>
                  </div>
                </button>

                {idx < steps.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-700 shrink-0 hidden sm:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
