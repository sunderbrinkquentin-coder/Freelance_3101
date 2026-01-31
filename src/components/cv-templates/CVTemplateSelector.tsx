// src/components/cv-templates/CVTemplateSelector.tsx

import { Check } from 'lucide-react';

export type CVTemplateType = 'modern' | 'classic' | 'minimal' | 'creative' | 'professional';

interface CVTemplateSelectorProps {
  selectedTemplate: CVTemplateType;
  onTemplateChange: (template: CVTemplateType) => void;
}

const templates = [
  {
    id: 'modern' as CVTemplateType,
    name: 'Modern',
    description: 'Farbenfroh mit Akzenten',
    preview: (
      <div className="w-full h-24 bg-gradient-to-br from-[#66c0b6] to-[#30E3CA] rounded-lg p-3 text-white">
        <div className="text-xs font-bold mb-1">Max Mustermann</div>
        <div className="text-[10px] opacity-80">Software Engineer</div>
        <div className="mt-2 space-y-0.5">
          <div className="h-1 w-full bg-white/30 rounded"></div>
          <div className="h-1 w-3/4 bg-white/30 rounded"></div>
        </div>
      </div>
    ),
  },
  {
    id: 'classic' as CVTemplateType,
    name: 'Klassisch',
    description: 'Zeitlos & seriös',
    preview: (
      <div className="w-full h-24 bg-white border-2 border-gray-300 rounded-lg p-3">
        <div className="text-xs font-bold mb-1 text-gray-900 border-b border-gray-300 pb-1">Max Mustermann</div>
        <div className="text-[10px] text-gray-600">Software Engineer</div>
        <div className="mt-2 space-y-1">
          <div className="h-1 w-full bg-gray-200 rounded"></div>
          <div className="h-1 w-2/3 bg-gray-200 rounded"></div>
        </div>
      </div>
    ),
  },
  {
    id: 'minimal' as CVTemplateType,
    name: 'Minimal',
    description: 'Schlicht & elegant',
    preview: (
      <div className="w-full h-24 bg-gray-50 rounded-lg p-3">
        <div className="text-xs font-light mb-1 text-gray-900">Max Mustermann</div>
        <div className="text-[10px] text-gray-500 tracking-wide">SOFTWARE ENGINEER</div>
        <div className="mt-2 space-y-1">
          <div className="h-0.5 w-full bg-gray-300"></div>
          <div className="h-0.5 w-1/2 bg-gray-300"></div>
        </div>
      </div>
    ),
  },
  {
    id: 'creative' as CVTemplateType,
    name: 'Kreativ',
    description: 'Auffällig & modern',
    preview: (
      <div className="w-full h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-3 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-4 -mt-4"></div>
        <div className="text-xs font-bold mb-1 relative z-10">Max Mustermann</div>
        <div className="text-[10px] opacity-90 relative z-10">Software Engineer</div>
        <div className="mt-2 space-y-0.5 relative z-10">
          <div className="h-1 w-full bg-white/40 rounded-full"></div>
          <div className="h-1 w-3/5 bg-white/40 rounded-full"></div>
        </div>
      </div>
    ),
  },
  {
    id: 'professional' as CVTemplateType,
    name: 'Professional',
    description: 'Corporate & vertrauenswürdig',
    preview: (
      <div className="w-full h-24 bg-white border-l-4 border-blue-900 shadow-sm rounded-lg p-3">
        <div className="text-xs font-bold mb-1 text-blue-900">Max Mustermann</div>
        <div className="text-[10px] text-gray-700">Software Engineer</div>
        <div className="mt-2 space-y-1">
          <div className="h-1 w-full bg-blue-100 rounded"></div>
          <div className="h-1 w-4/5 bg-blue-100 rounded"></div>
        </div>
      </div>
    ),
  },
];

export function CVTemplateSelector({ selectedTemplate, onTemplateChange }: CVTemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">CV-Design wählen</h3>
        <p className="text-xs text-white/60">Wähle das Design, das am besten zu dir passt</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {templates.map((template) => {
          const isComingSoon = template.id !== 'modern';
          const isDisabled = isComingSoon;

          return (
            <div key={template.id} className="relative">
              <button
                onClick={() => !isDisabled && onTemplateChange(template.id)}
                disabled={isDisabled}
                className={`relative p-3 rounded-xl border-2 transition-all text-left w-full ${
                  selectedTemplate === template.id
                    ? 'border-[#66c0b6] bg-[#66c0b6]/10'
                    : isDisabled
                    ? 'border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                {/* Coming Soon Badge */}
                {isComingSoon && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] rounded-md text-[10px] font-bold text-black z-10">
                    Coming Soon
                  </div>
                )}

                {/* Selected Indicator */}
                {selectedTemplate === template.id && !isDisabled && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-[#66c0b6] rounded-full flex items-center justify-center">
                    <Check size={12} className="text-black" />
                  </div>
                )}

                {/* Preview */}
                <div className={`mb-2 ${isComingSoon ? 'blur-[2px]' : ''}`}>
                  {template.preview}
                </div>

                {/* Info */}
                <div className={isComingSoon ? 'blur-[1px]' : ''}>
                  <div className="text-sm font-semibold text-white">{template.name}</div>
                  <div className="text-xs text-white/60">{template.description}</div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
