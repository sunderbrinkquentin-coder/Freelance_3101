export function getYearOptions(minYear: number = 1950): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];

  for (let year = currentYear; year >= minYear; year--) {
    years.push(year);
  }

  return years;
}

export function getMonthOptions(): { value: string; label: string }[] {
  return [
    { value: '01', label: 'Januar' },
    { value: '02', label: 'Februar' },
    { value: '03', label: 'März' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Dezember' }
  ];
}

export function formatDateRange(
  startMonth: string,
  startYear: string,
  endMonth: string,
  endYear: string,
  isCurrent: boolean
): string {
  const start = `${startMonth}/${startYear}`;
  const end = isCurrent ? 'heute' : `${endMonth}/${endYear}`;
  return `${start} – ${end}`;
}
