import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface ChipsInputProps {
  suggestedItems?: string[];
  selectedItems: string[];
  customItems: string[];
  onToggle: (item: string) => void;
  onAddCustom: (item: string) => void;
  onRemoveCustom: (item: string) => void;
  placeholder?: string;
  title?: string;
  customTitle?: string;
}

export function ChipsInput({
  suggestedItems = [],
  selectedItems,
  customItems,
  onToggle,
  onAddCustom,
  onRemoveCustom,
  placeholder = 'Eigenen Eintrag hinzufügen...',
  title = 'Wähle aus',
  customTitle = 'Deine eigenen Einträge'
}: ChipsInputProps) {
  const [customInput, setCustomInput] = useState('');

  const handleAdd = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;

    if (selectedItems.includes(trimmed) || customItems.includes(trimmed)) {
      return;
    }

    onAddCustom(trimmed);
    setCustomInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-8">
      {suggestedItems.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">{title}</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {suggestedItems.map((item) => (
              <button
                key={item}
                onClick={() => onToggle(item)}
                className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl border transition-all duration-200 text-sm sm:text-base hover:scale-105 ${
                  selectedItems.includes(item)
                    ? 'border-[#66c0b6] bg-[#66c0b6]/20 text-white shadow-[0_0_20px_rgba(102,192,182,0.3)]'
                    : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {customItems.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">{customTitle}</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {customItems.map((item) => (
              <button
                key={item}
                onClick={() => onToggle(item)}
                className={`group px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl border transition-all duration-200 text-sm sm:text-base hover:scale-105 flex items-center gap-2 ${
                  selectedItems.includes(item)
                    ? 'border-[#66c0b6] bg-[#66c0b6]/20 text-white shadow-[0_0_20px_rgba(102,192,182,0.3)]'
                    : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <span>{item}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveCustom(item);
                  }}
                  className="ml-1 p-1 rounded-full hover:bg-red-500/20 transition-colors"
                >
                  <X size={14} className="text-red-400" />
                </button>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-white/10 pt-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 transition-all"
          />
          <button
            onClick={handleAdd}
            disabled={!customInput.trim()}
            className="px-6 py-4 rounded-xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl whitespace-nowrap"
          >
            <Plus size={20} />
            <span>Hinzufügen</span>
          </button>
        </div>
        <p className="text-xs sm:text-sm text-white/50 mt-2">
          Drücke Enter oder klicke auf "Hinzufügen"
        </p>
      </div>
    </div>
  );
}
