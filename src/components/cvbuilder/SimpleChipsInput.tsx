import { useState } from 'react';
import { X } from 'lucide-react';

interface SimpleChipsInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function SimpleChipsInput({
  values = [],
  onChange,
  placeholder = 'Eintrag hinzufügen...'
}: SimpleChipsInputProps) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) return;

    onChange([...values, trimmed]);
    setInput('');
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      {/* Chips Display */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((value, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#66c0b6]/20 border border-[#66c0b6]/30 text-white text-sm"
            >
              {value}
              <button
                onClick={() => handleRemove(index)}
                className="p-0.5 rounded-full hover:bg-red-500/20 transition-colors"
                type="button"
              >
                <X size={14} className="text-red-400" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
      />
    </div>
  );
}
