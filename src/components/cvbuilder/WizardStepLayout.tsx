import { ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { AvatarSidebar } from './AvatarSidebar';

interface WizardStepLayoutProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  avatarMessage?: string;
  avatarStepInfo?: string;
  onPrev?: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  nextButtonText?: string;
  hideProgress?: boolean;
  children: ReactNode;
}

export function WizardStepLayout({
  currentStep,
  totalSteps,
  title,
  subtitle,
  avatarMessage,
  avatarStepInfo,
  onPrev,
  onNext,
  isNextDisabled = false,
  nextButtonText = 'Weiter',
  hideProgress = false,
  children
}: WizardStepLayoutProps) {
  return (
    <div className="h-full flex flex-col lg:flex-row lg:gap-8 lg:p-6 lg:max-w-7xl lg:mx-auto">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full lg:h-auto">
        {/* Header - Fixed on Mobile */}
        {!hideProgress && (
          <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#020617]/95 backdrop-blur-md z-50 px-4 pt-4 pb-2 border-b border-white/5">
            <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
          </div>
        )}

        {/* Desktop Progress */}
        {!hideProgress && (
          <div className="hidden lg:block mb-8">
            <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto lg:overflow-visible px-4 lg:px-0 pt-32 pb-36 lg:pt-0 lg:pb-0">
          <div className="max-w-3xl mx-auto space-y-6 lg:space-y-8">
            {/* Title Section */}
            <div className="text-center space-y-3 lg:space-y-4 animate-fade-in">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent leading-tight px-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-base sm:text-lg lg:text-xl text-white/70 px-2">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Step Content */}
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </div>

        {/* Bottom Navigation - Fixed on Mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent z-50 px-4 pb-safe pb-6 pt-4">
          <div className="flex justify-between items-center gap-3">
            {onPrev && (
              <button
                onClick={onPrev}
                className="flex items-center gap-2 px-5 py-4 rounded-xl text-white/70 hover:text-white active:bg-white/10 transition-all touch-manipulation min-w-[100px]"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Zurück</span>
              </button>
            )}
            <button
              onClick={onNext}
              disabled={isNextDisabled}
              className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg touch-manipulation"
            >
              {nextButtonText}
              <ArrowRight size={22} />
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex justify-between items-center pt-6">
          {onPrev && (
            <button
              onClick={onPrev}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
            >
              <ArrowLeft size={20} />
              Zurück
            </button>
          )}
          <button
            onClick={onNext}
            disabled={isNextDisabled}
            className="px-12 py-5 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 shadow-2xl hover:scale-105 ml-auto"
          >
            {nextButtonText}
            <ArrowRight size={24} />
          </button>
        </div>
      </div>

      {/* Avatar Sidebar - Desktop Only */}
      {avatarMessage && (
        <div className="hidden lg:block">
          <AvatarSidebar message={avatarMessage} stepInfo={avatarStepInfo} />
        </div>
      )}
    </div>
  );
}
