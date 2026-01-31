import { useRef, useEffect } from 'react';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

export function EditableText({
  value,
  onChange,
  className = '',
  placeholder = 'Text eingeben...',
  multiline = false
}: EditableTextProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newValue = e.currentTarget.textContent ?? '';
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newValue = e.currentTarget.textContent ?? '';
    onChange(newValue);
  };

  return (
    <div
      ref={ref}
      className={`
        ${className}
        outline-none
        focus:ring-2
        focus:ring-[#66c0b6]/50
        focus:ring-offset-2
        focus:ring-offset-transparent
        rounded
        px-1
        transition-all
        ${!value && 'text-gray-400 italic'}
      `}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onInput={handleInput}
      data-placeholder={placeholder}
      role="textbox"
      aria-label={placeholder}
    >
      {value || placeholder}
    </div>
  );
}
