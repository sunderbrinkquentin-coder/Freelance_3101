import { getYearOptions, getMonthOptions } from '../../utils/dateHelpers';

interface DateDropdownsProps {
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  isCurrent?: boolean;
  onStartChange: (month: string, year: string) => void;
  onEndChange: (month: string, year: string) => void;
  onCurrentChange?: (current: boolean) => void;
  showCurrentCheckbox?: boolean;
}

export function DateDropdowns({
  startMonth = '',
  startYear = '',
  endMonth = '',
  endYear = '',
  isCurrent = false,
  onStartChange,
  onEndChange,
  onCurrentChange,
  showCurrentCheckbox = true
}: DateDropdownsProps) {
  const years = getYearOptions(1950);
  const months = getMonthOptions();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-white/90 mb-2">
            Startmonat *
          </label>
          <select
            value={startMonth}
            onChange={(e) => onStartChange(e.target.value, startYear)}
            className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 cursor-pointer transition-all"
          >
            <option value="" className="bg-[#0a0a0a]">Monat wählen</option>
            {months.map(month => (
              <option key={month.value} value={month.value} className="bg-[#0a0a0a]">
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-white/90 mb-2">
            Startjahr *
          </label>
          <select
            value={startYear}
            onChange={(e) => onStartChange(startMonth, e.target.value)}
            className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 cursor-pointer transition-all"
          >
            <option value="" className="bg-[#0a0a0a]">Jahr wählen</option>
            {years.map(year => (
              <option key={year} value={year} className="bg-[#0a0a0a]">
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showCurrentCheckbox && (
        <div className="flex items-center gap-3 py-2">
          <input
            type="checkbox"
            id="current"
            checked={isCurrent}
            onChange={(e) => onCurrentChange?.(e.target.checked)}
            className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 cursor-pointer transition-all"
          />
          <label htmlFor="current" className="text-base text-white/80 cursor-pointer select-none">
            Ich bin hier aktuell tätig
          </label>
        </div>
      )}

      {!isCurrent && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
              Endmonat *
            </label>
            <select
              value={endMonth}
              onChange={(e) => onEndChange(e.target.value, endYear)}
              className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 cursor-pointer transition-all"
            >
              <option value="" className="bg-[#0a0a0a]">Monat wählen</option>
              {months.map(month => (
                <option key={month.value} value={month.value} className="bg-[#0a0a0a]">
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
              Endjahr *
            </label>
            <select
              value={endYear}
              onChange={(e) => onEndChange(endMonth, e.target.value)}
              className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 cursor-pointer transition-all"
            >
              <option value="" className="bg-[#0a0a0a]">Jahr wählen</option>
              {years.map(year => (
                <option key={year} value={year} className="bg-[#0a0a0a]">
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export function formatDateRange(
  startMonth: string,
  startYear: string,
  endMonth: string,
  endYear: string,
  isCurrent: boolean
): string {
  if (!startMonth || !startYear) return '';

  const start = `${startMonth}/${startYear}`;
  const end = isCurrent ? 'heute' : `${endMonth}/${endYear}`;

  return `${start} – ${end}`;
}
