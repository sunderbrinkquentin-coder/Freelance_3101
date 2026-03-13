import { Check } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  shortLabel?: string;
}

interface WizardProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: Set<number>;
}

export function WizardProgressIndicator({
  steps,
  currentStep,
  completedSteps
}: WizardProgressIndicatorProps) {
  return (
    <div className="w-full bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-2">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = completedSteps.has(index);
            const isPast = index < currentStep;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex items-center flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Step Circle */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        transition-all duration-300 font-semibold text-sm
                        ${
                          isActive
                            ? 'bg-gradient-to-br from-[#66c0b6] to-[#30E3CA] text-[#0a0a0a] shadow-lg shadow-[#66c0b6]/30 scale-110'
                            : isCompleted || isPast
                            ? 'bg-[#66c0b6]/20 text-[#66c0b6] border-2 border-[#66c0b6]/40'
                            : 'bg-white/5 text-white/40 border-2 border-white/10'
                        }
                      `}
                    >
                      {isCompleted || isPast ? (
                        <Check size={18} strokeWidth={3} />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    {isActive && (
                      <div className="absolute inset-0 bg-[#66c0b6]/30 rounded-full animate-ping"></div>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`
                        text-sm font-medium truncate transition-all duration-300
                        ${
                          isActive
                            ? 'text-[#66c0b6]'
                            : isCompleted || isPast
                            ? 'text-white/70'
                            : 'text-white/40'
                        }
                      `}
                    >
                      <span className="hidden lg:inline">{step.label}</span>
                      <span className="lg:hidden">{step.shortLabel || step.label}</span>
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className="flex-shrink-0 w-8 sm:w-12 lg:w-16 h-0.5 mx-2">
                    <div
                      className={`
                        h-full rounded-full transition-all duration-500
                        ${
                          isPast || isCompleted
                            ? 'bg-gradient-to-r from-[#66c0b6] to-[#30E3CA]'
                            : 'bg-white/10'
                        }
                      `}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Percentage */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/60">Gesamtfortschritt</p>
            <p className="text-xs font-semibold text-[#66c0b6]">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </p>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
