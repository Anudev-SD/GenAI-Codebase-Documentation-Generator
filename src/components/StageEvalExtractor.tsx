import React from 'react';
import { Target, AlertCircle, CheckCircle, Flame, Clock, Award, Terminal } from 'lucide-react';

interface StageEvalExtractorProps {
  evaluation: any;
}

export const StageEvalExtractor: React.FC<StageEvalExtractorProps> = ({ evaluation }) => {
  if (!evaluation) return null;

  const { has_real_eval_data, eval_framework, metrics, overall_summary, is_fallback_plan, test_run_command, recommended_eval_dataset } = evaluation;

  return (
    <div className="space-y-6">
      {/* Mode Status Banner */}
      <div
        className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          is_fallback_plan
            ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
            : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {is_fallback_plan ? (
              <AlertCircle className="w-5 h-5 text-amber-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            )}
            <span className="font-semibold text-sm">
              {is_fallback_plan ? 'Intended Evaluation Plan (Fallback Activated)' : 'Verified Benchmark Evaluation Data'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">{overall_summary}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#161b22] border border-[#30363d] text-zinc-300">
            Framework: <span className="text-cyan-400 font-bold">{eval_framework}</span>
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {metrics.map((m: any, idx: number) => {
          const isPass = m.score !== null ? m.score >= m.target : null;
          return (
            <div key={idx} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
                    {m.category}
                  </span>
                  {m.score !== null ? (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        isPass
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {isPass ? 'Meets Target' : 'Needs Optimization'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Target Metric
                    </span>
                  )}
                </div>

                <div className="text-sm font-semibold text-zinc-100 mb-3">{m.metric_name}</div>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <div className="text-2xl font-bold font-mono text-zinc-100">
                    {m.score !== null ? m.score.toFixed(3) : 'Pending'}
                  </div>
                  <div className="text-xs font-mono text-zinc-400">Target: ≥ {m.target.toFixed(2)}</div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#21262d] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      m.score !== null
                        ? isPass ? 'bg-emerald-500' : 'bg-amber-500'
                        : 'bg-blue-500/50'
                    }`}
                    style={{ width: `${Math.min(100, ((m.score !== null ? m.score : m.target) / 1.0) * 100)}%` }}
                  />
                </div>

                <div className="text-[10px] font-mono text-zinc-500 mt-2 truncate">
                  Source: {m.benchmark_source}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommended Run Command & Dataset */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <Award className="w-4 h-4 text-amber-400" /> Evaluation Dataset Recommendation
          </div>
          <p className="text-xs text-zinc-400">{recommended_eval_dataset}</p>
        </div>

        <div className="bg-[#0d1117] border border-[#30363d] px-3.5 py-2.5 rounded-lg flex items-center gap-3 shrink-0">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <code className="text-xs font-mono text-emerald-400">{test_run_command}</code>
        </div>
      </div>
    </div>
  );
};
